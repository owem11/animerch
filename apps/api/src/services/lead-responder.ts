import { EmailService } from "./email.service";
import { AIService } from "./ai.service";
import { db } from "../db";
import { leads, supportEmails, products } from "../db/schema";
import { eq, ilike } from "drizzle-orm";

export async function startSupportAutomation() {
    if (!process.env.GEMINI_API_KEY || !process.env.GMAIL_USER_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
        console.warn("Missing necessary environment variables for Email Automation (Gemini/Gmail App Password). Disabling IMAP listener.");
        return;
    }

    const emailService = new EmailService();
    const aiService = new AIService(process.env.GEMINI_API_KEY);

    emailService.startListening(async (email) => {
        console.log(`Analyzing new email: ${email.subject}`);

        try {
            // AI Analysis
            const analysis = await aiService.analyzeEmail(email.body);
            const summarizedIncoming = analysis.summary;
            const keywords = analysis.productSearch;

            // Database Product Search
            let productData: any = null;
            if (keywords?.productTitle) {
                const results = await db.select().from(products).where(ilike(products.title, `%${keywords.productTitle}%`)).limit(3);
                if (results.length > 0) {
                    productData = {
                        exactMatch: results[0],
                        alternatives: results.slice(1)
                    };
                }
            } else if (keywords?.category) {
                const results = await db.select().from(products).where(ilike(products.category, `%${keywords.category}%`)).limit(3);
                if (results.length > 0) {
                    productData = { alternatives: results };
                }
            }

            // Upsert Lead
            const existingLead = await db.select().from(leads).where(eq(leads.email, email.fromHeader)).limit(1);
            if (existingLead.length === 0) {
                await db.insert(leads).values({
                    email: email.fromHeader,
                });
            } else {
                await db.update(leads)
                    .set({ lastInteraction: new Date() })
                    .where(eq(leads.id, existingLead[0].id));
            }

            if (analysis.guardrail?.triggered) {
                console.log('Guardrail triggered! Drafting response and notifying admin.');

                // Store incoming as drafted
                await db.insert(supportEmails).values({
                    messageId: email.id,
                    threadId: email.threadId,
                    direction: 'incoming',
                    sender: email.fromHeader,
                    recipient: process.env.GMAIL_USER_EMAIL!,
                    subject: email.subject,
                    summarizedBody: summarizedIncoming,
                    fullBody: email.body,
                    status: 'drafted',
                    guardrailTriggered: true
                });

                // Notify Admin via Email
                const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'abhishek29112003@gmail.com';
                await emailService.sendReply(
                    adminEmail,
                    `URGENT: Guardrail Triggered for Lead`,
                    `Animerch AI Guardrail Triggered.\nReason: ${analysis.triggerReason || 'Unknown'}\n\nSummary:\n${summarizedIncoming}\n\nPlease check the dashboard.`,
                    email.messageIdHeader
                );

            } else {
                // Safe - Automated Response
                const responseBody = await aiService.generateResponse(
                    [],
                    email.body,
                    "Animerch is an anime merchandise store selling hoodies, shirts, and accessories.",
                    productData
                );
                const summarizedOutgoing = await aiService.summarize(responseBody);

                // Send the reply
                const sentMsg = await emailService.sendReply(
                    email.fromHeader,
                    `Re: ${email.subject}`,
                    responseBody,
                    email.messageIdHeader
                );

                // Store Incoming
                await db.insert(supportEmails).values({
                    messageId: email.id,
                    threadId: email.threadId,
                    direction: 'incoming',
                    sender: email.fromHeader,
                    recipient: process.env.GMAIL_USER_EMAIL!,
                    subject: email.subject,
                    summarizedBody: summarizedIncoming,
                    fullBody: email.body,
                    status: 'automated',
                    guardrailTriggered: false
                });

                // Store Outgoing
                await db.insert(supportEmails).values({
                    messageId: sentMsg.id!,
                    threadId: email.threadId,
                    direction: 'outgoing',
                    sender: process.env.GMAIL_USER_EMAIL!,
                    recipient: email.fromHeader,
                    subject: `Re: ${email.subject}`,
                    summarizedBody: summarizedOutgoing,
                    fullBody: responseBody,
                    status: 'automated',
                    guardrailTriggered: false
                });

                console.log(`Successfully auto-replied to: ${email.fromHeader}`);
            }
        } catch (error) {
            console.error('Error processing email automation logic:', error);
        }
    });

    console.log("Support Email Automation (IMAP Listener) initialized and active!");
}
