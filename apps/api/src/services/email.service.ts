import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';

export interface EmailData {
    id: string;
    threadId: string;
    fromHeader: string;
    subject: string;
    messageIdHeader: string;
    body: string;
}

export class EmailService {
    private client: ImapFlow;
    private transporter: nodemailer.Transporter;

    constructor() {
        this.client = new ImapFlow({
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER_EMAIL!,
                pass: process.env.GMAIL_APP_PASSWORD!
            },
            logger: false
        });

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER_EMAIL!,
                pass: process.env.GMAIL_APP_PASSWORD!
            }
        });
    }

    async startListening(onNewEmail: (email: EmailData) => Promise<void>) {
        this.client.on('error', (err) => {
            console.error('IMAP Error Background (Auto-handled):', err.message);
        });
        this.client.on('close', () => {
            console.log('IMAP Connection Closed. Reconnecting in 5s...');
            setTimeout(() => this.startListening(onNewEmail).catch(console.error), 5000);
        });

        try {
            await this.client.connect();
            const lock = await this.client.getMailboxLock('INBOX');
            console.log('IMAP listener connected and waiting for new emails...');

            // Process any unread emails immediately
            await this.processUnread(onNewEmail);

            // Listen for new incoming emails
            this.client.on('exists', async () => {
                await this.processUnread(onNewEmail);
            });
        } catch (err) {
            console.error('Failed to start IMAP listener. Retrying in 5s...', err);
            setTimeout(() => this.startListening(onNewEmail).catch(console.error), 5000);
        }
    }

    private async processUnread(onNewEmail: (email: EmailData) => Promise<void>) {
        const searchArray = await this.client.search({ seen: false });
        if (!searchArray || searchArray.length === 0) return;

        console.log(`Found ${searchArray.length} unread emails. Processing...`);

        for await (const msg of this.client.fetch(searchArray, { source: true, uid: true })) {
            if (!msg.source) continue;
            const parsed = await simpleParser(msg.source);

            const emailData: EmailData = {
                id: msg.uid.toString(),
                threadId: parsed.messageId || msg.uid.toString(),
                fromHeader: parsed.from?.text || '',
                subject: parsed.subject || '',
                messageIdHeader: parsed.messageId || '',
                body: parsed.text || ''
            };

            console.log(`Processing email from ${emailData.fromHeader}: ${emailData.subject}`);

            try {
                // Let the AI process it
                await onNewEmail(emailData);

                // Mark as SEEN so we don't process it again
                await this.client.messageFlagsAdd(msg.uid, ['\\Seen'], { uid: true });
            } catch (error) {
                console.error(`Failed to process email ${msg.uid}:`, error);
            }
        }
    }

    async sendReply(to: string, subject: string, body: string, inReplyToMessageId?: string) {
        const info = await this.transporter.sendMail({
            from: process.env.GMAIL_USER_EMAIL,
            to: to,
            subject: subject,
            text: body,
            inReplyTo: inReplyToMessageId,
            references: inReplyToMessageId ? [inReplyToMessageId] : undefined
        });
        return { id: info.messageId };
    }
}
