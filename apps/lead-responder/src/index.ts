import express from 'express';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import path from 'path';
import { GmailService } from './services/gmail.service';
import { DatabaseService } from './services/db.service';
import { AIService } from './services/ai.service';

console.log('Starting server...');
dotenv.config();
console.log('Dotenv configured');

// Initialize Services
const databaseService = new DatabaseService(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const aiService = new AIService(process.env.GEMINI_API_KEY!);

const app = express();
const port = process.env.PORT || 3001;
console.log('App instance created on port', port);

app.use(express.json());

// OAuth2 Setup
console.log('Setting up OAuth2 client...');
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `http://localhost:${port}/oauth2callback`
);
console.log('OAuth2 client initialized');

// Route to start Authentication
app.get('/auth', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.redirect(url);
});

// OAuth2 Callback
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log('--- TOKENS RECEIVED ---');
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Access Token:', tokens.access_token);
    console.log('-----------------------');

    res.send(`
      <h1>Authentication successful!</h1>
      <p>Please copy the <b>Refresh Token</b> below and paste it back into our chat:</p>
      <div style="padding: 10px; background: #f0f0f0; border: 1px solid #ccc; font-family: monospace; word-break: break-all;">
        ${tokens.refresh_token}
      </div>
      <p><i>You can close this window after copying.</i></p>
    `);
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).send('Authentication failed.');
  }
});

// Gmail Webhook Endpoint (Pub/Sub)
app.post('/api/webhook/gmail', async (req, res) => {
  try {
    const message = req.body.message;
    if (!message) {
      return res.status(400).send('No message found');
    }

    // Decode Pub/Sub message
    const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
    const { historyId } = data;
    console.log('New Email Notification. HistoryID:', historyId);

    // Setup Auth for Services
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const gmailService = new GmailService(auth);

    // 1. Get last processed history ID
    const lastHistoryId = await databaseService.getConfig('last_history_id');

    if (lastHistoryId && lastHistoryId !== '0') {
      // 2. Fetch new messages
      const newMessages = await gmailService.getMessagesFromHistory(lastHistoryId);
      console.log(`Found ${newMessages.length} new messages to process.`);

      for (const msg of newMessages) {
        if (!msg.id) continue;

        // 3. Fetch full email content
        const fullEmail = await gmailService.getEmail(msg.id);
        const threadId = fullEmail.threadId!;
        const headers = fullEmail.payload?.headers || [];
        const fromHeader = headers.find(h => h.name === 'From')?.value || '';
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const messageIdHeader = headers.find(h => h.name === 'Message-ID')?.value || '';

        // Extract plain text body
        let body = '';
        const parts = fullEmail.payload?.parts || [];
        const mainPart = parts.find(p => p.mimeType === 'text/plain') || fullEmail.payload;
        if (mainPart?.body?.data) {
          body = Buffer.from(mainPart.body.data, 'base64').toString();
        }

        console.log(`Processing email from ${fromHeader}: ${subject}`);

        // 4. Consolidated AI Analysis (Guardrails, Summary, Keywords)
        const analysis = await aiService.analyzeEmail(body);
        const summarizedIncoming = analysis.summary;
        const keywords = analysis.productSearch;
        const productData = await databaseService.findProduct(keywords);

        // Upsert Lead
        await databaseService.upsertLead(fromHeader);

        if (analysis.guardrail.triggered) {
          console.log('Guardrail triggered! Drafting response and notifying admin.');

          // Case A: Guardrail Triggered - Create Draft
          // We'll just store it as "drafted" in DB for now, 
          // and in a real app we'd call gmail.users.drafts.create
          await databaseService.storeEmail({
            message_id: msg.id,
            thread_id: threadId,
            direction: 'incoming',
            sender: fromHeader,
            recipient: 'animerch.help@gmail.com',
            subject: subject,
            summarized_body: summarizedIncoming,
            full_body: body,
            status: 'drafted',
            guardrail_triggered: true
          });

          // Notify Admin via Email
          const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'abhishek29112003@gmail.com';
          await gmailService.sendReply(
            adminEmail,
            `URGENT: Guardrail Triggered for Lead`,
            `Animerch AI Guardrail Triggered.\nReason: ${analysis.triggerReason}\n\nSummary:\n${summarizedIncoming}\n\nPlease check the dashboard.`,
            threadId,
            messageIdHeader
          );

        } else {
          // Case B: Safe - Automated Response
          const responseBody = await aiService.generateResponse(
            [],
            body,
            "Animerch is an anime merchandise store selling hoodies, shirts, and accessories.",
            productData
          );
          const summarizedOutgoing = await aiService.summarize(responseBody);

          // Send the reply
          const sentMsg = await gmailService.sendReply(fromHeader, `Re: ${subject}`, responseBody, threadId, messageIdHeader);

          // Store Incoming
          await databaseService.storeEmail({
            message_id: msg.id,
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

          // Store Outgoing
          await databaseService.storeEmail({
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
        }
      }
    }

    // 5. Update last processed history ID
    await databaseService.updateConfig('last_history_id', historyId);

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/health', (req, res) => {
  res.send('Lead Responder is healthy');
});

// Route to register Gmail Watch
app.get('/setup-watch', async (req, res) => {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const gmail = google.gmail({ version: 'v1', auth });
    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: `projects/${process.env.GOOGLE_PROJECT_ID}/topics/${process.env.PUBSUB_TOPIC_NAME}`,
        labelIds: ['INBOX'],
      },
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Watch Setup Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Lead Responder listening at http://localhost:${port}`);
});
