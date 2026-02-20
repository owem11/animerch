import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GmailService {
    private gmail;

    constructor(auth: OAuth2Client) {
        this.gmail = google.gmail({ version: 'v1', auth });
    }

    /**
     * Register a watch on the inbox to send notifications to Pub/Sub
     */
    async setupWatch(topicName: string) {
        try {
            const res = await this.gmail.users.watch({
                userId: 'me',
                requestBody: {
                    topicName: topicName,
                    labelIds: ['INBOX'],
                },
            });
            console.log('Gmail Watch set up:', res.data);
            return res.data;
        } catch (error) {
            console.error('Error setting up Gmail watch:', error);
            throw error;
        }
    }

    /**
     * Fetch messages added after a certain historyId
     */
    async getMessagesFromHistory(startHistoryId: string) {
        try {
            const res = await this.gmail.users.history.list({
                userId: 'me',
                startHistoryId: startHistoryId,
                historyTypes: ['messageAdded'],
            });

            const history = res.data.history || [];
            const messages = history.flatMap(h => h.messagesAdded?.map(ma => ma.message) || []);

            // Filter out nulls and duplicates (often happens with history)
            const uniqueMessages = Array.from(new Set(messages.map(m => m?.id))).map(id => messages.find(m => m?.id === id));

            return uniqueMessages.filter(Boolean);
        } catch (error) {
            console.error('Error fetching history:', error);
            throw error;
        }
    }

    /**
     * Fetch a specific email by ID
     */
    async getEmail(id: string) {
        try {
            const res = await this.gmail.users.messages.get({
                userId: 'me',
                id: id,
                format: 'full',
            });
            return res.data;
        } catch (error) {
            console.error('Error fetching email:', error);
            throw error;
        }
    }

    /**
     * Send a reply to an email
     */
    async sendReply(to: string, subject: string, body: string, threadId: string, inReplyToMessageId?: string) {
        // Gmail API requires emails to be base64url encoded
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
            `From: animerch.help@gmail.com`,
            `To: ${to}`,
            `Subject: ${utf8Subject}`,
            inReplyToMessageId ? `In-Reply-To: ${inReplyToMessageId}` : '',
            inReplyToMessageId ? `References: ${inReplyToMessageId}` : '',
            `Content-Type: text/plain; charset=utf-8`,
            `MIME-Version: 1.0`,
            '',
            body,
        ].filter(Boolean);
        const message = messageParts.join('\n');

        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        try {
            const res = await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage,
                    threadId: threadId,
                },
            });
            return res.data;
        } catch (error) {
            console.error('Error sending reply:', error);
            throw error;
        }
    }
}
