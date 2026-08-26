import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class DatabaseService {
    private supabase: SupabaseClient;

    constructor(url: string, key: string) {
        this.supabase = createClient(url, key);
    }

    /**
     * Upsert a lead (create or update last interaction)
     */
    async upsertLead(email: string, fullName?: string) {
        console.log(`Upserting lead: ${email}`);
        const { data, error } = await this.supabase
            .from('leads')
            .upsert({ email, full_name: fullName, last_interaction: new Date() }, { onConflict: 'email' })
            .select();

        if (error) {
            console.error('Error upserting lead:', error);
            throw error;
        }
        console.log(`Lead upserted successfully: ${data[0]?.id}`);
        return data[0];
    }

    /**
     * Store a support email (incoming or outgoing)
     */
    async storeEmail(emailData: {
        message_id: string;
        thread_id: string;
        direction: 'incoming' | 'outgoing';
        sender: string;
        recipient: string;
        subject?: string;
        summarized_body?: string;
        full_body?: string;
        status?: 'automated' | 'drafted' | 'pending_approval' | 'error';
        guardrail_triggered?: boolean;
    }) {
        console.log(`Storing ${emailData.direction} email: ${emailData.message_id}`);
        const { data, error } = await this.supabase
            .from('support_emails')
            .insert([emailData])
            .select();

        if (error) {
            console.error('Error storing email:', error);
            throw error;
        }
        console.log(`Email stored successfully: ${data[0]?.id}`);
        return data[0];
    }

    /**
     * Get email history for a thread
     */
    async getThreadHistory(threadId: string) {
        const { data, error } = await this.supabase
            .from('support_emails')
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching thread history:', error);
            throw error;
        }
        return data;
    }

    /**
     * Get a system config value
     */
    async getConfig(key: string) {
        const { data, error } = await this.supabase
            .from('system_config')
            .select('value')
            .eq('key', key)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
            console.error('Error fetching config:', error);
            throw error;
        }
        return data?.value;
    }

    /**
     * Update a system config value
     */
    async updateConfig(key: string, value: string) {
        const { error } = await this.supabase
            .from('system_config')
            .upsert({ key, value, updated_at: new Date() });

        if (error) {
            console.error('Error updating config:', error);
            throw error;
        }
    }

    /**
     * Find a product based on keywords (title or category)
     */
    async findProduct(keywords: { productTitle?: string | null, category?: string | null }) {
        const { productTitle, category } = keywords;

        console.log(`Searching DB for Product: ${productTitle}, Category: ${category}`);

        // 1. Try for exact/close title match first
        if (productTitle && productTitle !== 'null') {
            const { data: matches, error: titleError } = await this.supabase
                .from('products')
                .select('*')
                .ilike('title', `%${productTitle}%`)
                .limit(1);

            if (!titleError && matches && matches.length > 0) {
                console.log(`Found exact match: ${matches[0].title}`);
                return { exactMatch: matches[0] };
            }
        }

        // 2. Fallback to category match if no title match
        if (category && category !== 'null') {
            const { data: alternatives, error: altError } = await this.supabase
                .from('products')
                .select('*')
                .ilike('category', `%${category}%`)
                .limit(3);

            if (!altError && alternatives && alternatives.length > 0) {
                console.log(`Found ${alternatives.length} alternatives in category: ${category}`);
                return { alternatives };
            }
        }

        // 3. Last fallback: just some products if nothing else matches
        const { data: genericAlt } = await this.supabase
            .from('products')
            .select('*')
            .limit(3);

        console.log('No specific matches found. Returning generic alternatives.');
        return { alternatives: genericAlt || [] };
    }
}
