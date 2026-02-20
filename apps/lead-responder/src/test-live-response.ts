import { google } from 'googleapis';
import dotenv from 'dotenv';
import { GmailService } from './services/gmail.service';
import { DatabaseService } from './services/db.service';
import { AIService } from './services/ai.service';

dotenv.config();

async function testLiveResponse() {
    console.log('--- STARTING FINAL LIVE RESPONSE TEST ---');

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const gmailService = new GmailService(auth);
    const dbService = new DatabaseService(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const aiService = new AIService(process.env.GEMINI_API_KEY!);

    try {
        // 1. Fetch the absolute latest message from INBOX
        const gmail = google.gmail({ version: 'v1', auth });
        const listRes = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 1,
            q: 'label:INBOX'
        });

        const messages = listRes.data.messages || [];
        if (messages.length === 0) {
            console.log('No messages found in INBOX.');
            return;
        }

        const msg = messages[0];
        const fullEmail = await gmailService.getEmail(msg.id!);
        const threadId = fullEmail.threadId!;
        const headers = fullEmail.payload?.headers || [];

        const fromHeader = headers.find(h => h.name === 'From')?.value || '';
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const messageIdHeader = headers.find(h => h.name === 'Message-ID')?.value || '';

        console.log(`Processing message: [${subject}] from [${fromHeader}]`);

        // Extract Body
        let body = '';
        const parts = fullEmail.payload?.parts || [];
        if (fullEmail.payload?.body?.data) {
            body = Buffer.from(fullEmail.payload.body.data, 'base64').toString();
        } else if (parts[0]?.body?.data) {
            body = Buffer.from(parts[0].body.data, 'base64').toString();
        }

        // 2. AI Analysis
        console.log('AI Analyzing and Generating Response...');
        const analysis = await aiService.analyzeEmail(body);
        const summarizedIncoming = analysis.summary;

        if (analysis.guardrail.triggered) {
            console.log('GUARDRAIL TRIGGERED. Will not send automated response.');
            return;
        }

        // Product Extraction & Lookup
        const keywords = analysis.productSearch;
        const productData = await dbService.findProduct(keywords);

        const responseBody = await aiService.generateResponse(
            [],
            body,
            "Animerch is an anime store selling hoodies and accessories.",
            productData
        );
        const summarizedOutgoing = await aiService.summarize(responseBody);

        console.log('AI Response Generated:', responseBody.substring(0, 100) + '...');

        // 3. SEND THE EMAIL (REAL)
        console.log('SENDING REAL EMAIL REPLY...');
        const sentMsg = await gmailService.sendReply(fromHeader, `Re: ${subject}`, responseBody, threadId, messageIdHeader);
        console.log('Email Sent! Message ID:', sentMsg.id);
        console.log('THREAD ID:', threadId);
        console.log('IN-REPLY-TO:', messageIdHeader);

        // 4. Update Database
        console.log('Recording in Supabase...');
        await dbService.upsertLead(fromHeader);

        // Store Incoming
        await dbService.storeEmail({
            message_id: msg.id!,
            thread_id: threadId,
            direction: 'incoming',
            sender: fromHeader,
            recipient: 'animerch.help@gmail.com',
            subject: subject,
            summarized_body: summarizedIncoming,
            full_body: body,
            status: 'automated',
            guardrail_triggered: false
        });

        // Store Outgoing (The AI Response)
        await dbService.storeEmail({
            message_id: sentMsg.id!,
            thread_id: threadId,
            direction: 'outgoing',
            sender: 'animerch.help@gmail.com',
            recipient: fromHeader,
            subject: `Re: ${subject}`,
            summarized_body: summarizedOutgoing,
            full_body: responseBody,
            status: 'automated'
        });

        console.log('--- TEST COMPLETE. CHECK YOUR INBOX! ---');

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testLiveResponse();
