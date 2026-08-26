import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function cleanStart() {
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('Clearing all test records from Supabase...');
    await supabase.from('support_emails').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('system_config').upsert({ key: 'last_history_id', value: '0' });

    console.log('Database clean. Ready for test.');
}

cleanStart();
