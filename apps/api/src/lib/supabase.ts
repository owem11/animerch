import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../../../.env");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

console.log(`Supabase Lib: Using env from ${envPath}`);
console.log(`Supabase Lib: URL=${supabaseUrl}, ServiceKey=${supabaseServiceKey ? "Set" : "Not Set"}`);

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials missing in backend lib/supabase.ts");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
