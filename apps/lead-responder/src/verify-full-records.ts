import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyFinalTest() {
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('--- VERIFYING SUPABASE RECORDS ---');
    const { data, error } = await supabase
        .from('support_emails')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error:', error);
        return;
    }

    data.forEach((email, index) => {
        console.log(`\nMESSAGE #${index + 1} [${email.direction.toUpperCase()}]`);
        console.log(`From: ${email.sender}`);
        console.log(`To: ${email.recipient}`);
        console.log(`Subject: ${email.subject}`);
        console.log(`--- FULL BODY ---`);
        console.log(email.full_body);
        console.log(`----------------`);
    });
}

verifyFinalTest();
