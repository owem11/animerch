import express from 'express';
import dotenv from 'dotenv';
import { DatabaseService } from './services/db.service';
import { AIService } from './services/ai.service';
import { EmailService } from './services/email.service';

console.log('Starting Lead Responder...');
dotenv.config();

// Initialize Services
const databaseService = new DatabaseService(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const aiService = new AIService(process.env.GEMINI_API_KEY!);
const emailService = new EmailService();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Start IMAP Listener in the background
emailService.startListening(async (email) => {
  console.log(`Analyzing email: ${email.subject}`);

  // AI Analysis
  const analysis = await aiService.analyzeEmail(email.body);
  const summarizedIncoming = analysis.summary;
  const keywords = analysis.productSearch;
  const productData = await databaseService.findProduct(keywords);

  // Upsert Lead
  await databaseService.upsertLead(email.fromHeader);

  if (analysis.guardrail.triggered) {
    console.log('Guardrail triggered! Drafting response and notifying admin.');

    // Drafted
    await databaseService.storeEmail({
      message_id: email.id, // UID
      thread_id: email.threadId,
      direction: 'incoming',
      sender: email.fromHeader,
      recipient: process.env.GMAIL_USER_EMAIL || 'animerch.help@gmail.com',
      subject: email.subject,
      summarized_body: summarizedIncoming,
      full_body: email.body,
      status: 'drafted',
      guardrail_triggered: true
    });

    // Notify Admin via Email
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'abhishek29112003@gmail.com';
    await emailService.sendReply(
      adminEmail,
      `URGENT: Guardrail Triggered for Lead`,
      `Animerch AI Guardrail Triggered.\nReason: ${analysis.triggerReason}\n\nSummary:\n${summarizedIncoming}\n\nPlease check the dashboard.`,
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
    await databaseService.storeEmail({
      message_id: email.id, // UID
      thread_id: email.threadId,
      direction: 'incoming',
      sender: email.fromHeader,
      recipient: process.env.GMAIL_USER_EMAIL || 'animerch.help@gmail.com',
      subject: email.subject,
      summarized_body: summarizedIncoming,
      full_body: email.body,
      status: 'automated',
      guardrail_triggered: false
    });

    // Store Outgoing
    await databaseService.storeEmail({
      message_id: sentMsg.id!,
      thread_id: email.threadId,
      direction: 'outgoing',
      sender: process.env.GMAIL_USER_EMAIL || 'animerch.help@gmail.com',
      recipient: email.fromHeader,
      subject: `Re: ${email.subject}`,
      summarized_body: summarizedOutgoing,
      full_body: responseBody,
      status: 'automated'
    });

    console.log(`Successfully replied to: ${email.fromHeader}`);
  }
});

app.get('/health', (req, res) => {
  res.send('Lead Responder (IMAP Version) is healthy and listening silently.');
});

app.listen(port, () => {
  console.log(`Lead Responder running on http://localhost:${port}`);
  console.log('Continuous IMAP listener is active. Webhooks and OAuth are now deprecated.');
});
