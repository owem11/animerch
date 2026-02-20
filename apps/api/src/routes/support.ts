import { Router, Request, Response } from "express";
import { db } from "../db";
import { supportEmails, leads } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { google } from "googleapis";

const router = Router();

// Helper to send email via Gmail API
async function sendEmailToHelp(senderEmail: string, senderName: string, subject: string, body: string) {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/oauth2callback"
    );

    auth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const gmail = google.gmail({ version: "v1", auth });

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
        `From: ${senderName} <${senderEmail}>`,
        `To: ${process.env.GMAIL_USER_EMAIL || "animerch.help@gmail.com"}`,
        `Subject: ${utf8Subject}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        body,
    ];
    const message = messageParts.join('\n');

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
        },
    });
}

// GET /api/support/queries - Fetch all support emails for admin
router.get("/queries", async (req: Request, res: Response) => {
    try {
        const queries = await db.select()
            .from(supportEmails)
            .orderBy(desc(supportEmails.createdAt))
            .limit(50);

        res.json(queries);
    } catch (error) {
        console.error("Failed to fetch support queries:", error);
        res.status(500).json({ error: "Failed to fetch queries" });
    }
});

// GET /api/support/leads - Fetch all leads for admin
router.get("/leads", async (req: Request, res: Response) => {
    try {
        const result = await db.select()
            .from(leads)
            .orderBy(desc(leads.lastInteraction));

        res.json(result);
    } catch (error) {
        console.error("Failed to fetch leads:", error);
        res.status(500).json({ error: "Failed to fetch leads" });
    }
});

// POST /api/support/contact - Submit a contact message from user
router.post("/contact", async (req: Request, res: Response) => {
    try {
        const { name, email, message, subject } = req.body;

        if (!email || !message) {
            return res.status(400).json({ error: "Email and message are required" });
        }

        // 1. Log the lead
        await db.insert(leads).values({
            email,
            fullName: name || "Anonymous",
            lastInteraction: new Date(),
        }).onConflictDoUpdate({
            target: leads.email,
            set: { lastInteraction: new Date(), fullName: name || "Anonymous" }
        });

        // 2. Send actual email to trigger LRS
        try {
            await sendEmailToHelp(email, name || "Web User", subject || "Support Request", message);
            console.log("Email sent to help inbox successfully.");
        } catch (mailError) {
            console.error("Failed to send email to help inbox:", mailError);
            // We continue even if email fails, so it still shows in dashboard
        }

        // 3. Log the email as incoming
        await db.insert(supportEmails).values({
            messageId: `web-contact-${Date.now()}`,
            threadId: `thread-web-${Date.now()}`,
            direction: "incoming",
            sender: email,
            recipient: process.env.GMAIL_USER_EMAIL || "animerch.help@gmail.com",
            subject: subject || "New Contact Form Submission",
            fullBody: message,
            summarizedBody: message.substring(0, 100) + (message.length > 100 ? "..." : ""),
            status: "pending_approval",
        });

        res.json({ success: true, message: "Message received. Our AI will respond shortly!" });
    } catch (error) {
        console.error("Failed to submit contact form:", error);
        res.status(500).json({ error: "Failed to submit message" });
    }
});

export default router;
