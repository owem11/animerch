import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

console.log("Supabase URL:", supabaseUrl);
console.log("Service Key start:", supabaseServiceKey.substring(0, 10) + "...");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testStorage() {
    console.log("1. Listing buckets...");
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error("Error listing buckets:", listError);
        return;
    }
    console.log("Buckets found:", buckets?.map(b => b.name));

    const bucketName = "avatars";
    if (!buckets?.find(b => b.name === bucketName)) {
        console.log(`2. Creating bucket ${bucketName}...`);
        const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true
        });
        if (createError) {
            console.error("Error creating bucket:", createError);
            return;
        }
        console.log("Bucket created:", createData);
    } else {
        console.log(`2. Bucket ${bucketName} already exists.`);
    }

    console.log("3. Attempting test upload...");
    const dummyBuffer = Buffer.from(`this is a test file ${Date.now()}`);
    const testFileName = `test-${Date.now()}.txt`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(testFileName, dummyBuffer, {
            contentType: "text/plain",
            upsert: true
        });

    if (uploadError) {
        console.error("Upload error details:", JSON.stringify(uploadError, null, 2));
    } else {
        console.log("Upload success:", uploadData);
    }

    console.log("4. Listing files in bucket...");
    const { data: files, error: listFilesError } = await supabase.storage
        .from(bucketName)
        .list();

    if (listFilesError) {
        console.error("Error listing files:", listFilesError);
    } else {
        console.log("Files in bucket:", files?.map(f => f.name));
    }

    if (uploadData) {
        console.log("5. Getting public URL...");
        const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uploadData.path);
        console.log("Public URL:", urlData.publicUrl);
    }
}

testStorage();
