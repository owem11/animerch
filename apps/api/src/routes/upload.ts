import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { supabase } from "../lib/supabase";

const router = Router();

// Configure multer to store in memory for Supabase upload
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images are allowed"));
        }
    },
});

router.post("/", upload.single("image"), async (req: Request, res: Response) => {
    try {
        console.log("Upload request received");
        if (!req.file) {
            console.log("No file in request");
            return res.status(400).json({ error: "No image file uploaded" });
        }

        const file = req.file;
        console.log(`Processing file: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);

        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const bucketName = "avatars";

        console.log(`Checking bucket: ${bucketName}`);
        // Check if bucket exists, create if not (using service role)
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) {
            console.error("Error listing buckets:", listError);
            throw listError;
        }

        if (!buckets?.find(b => b.name === bucketName)) {
            console.log(`Bucket ${bucketName} not found. Creating...`);
            const { error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true,
                allowedMimeTypes: ["image/*"],
                fileSizeLimit: 5242880 // 5MB
            });
            if (createError) {
                console.error("Error creating bucket:", createError);
                throw createError;
            }
            console.log(`Bucket ${bucketName} created successfully`);
        } else {
            console.log(`Bucket ${bucketName} already exists`);
        }

        console.log(`Uploading file ${fileName} to bucket ${bucketName}...`);
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) {
            console.error("Supabase upload error details:", JSON.stringify(error, null, 2));
            return res.status(500).json({ error: "Cloud storage upload failed", details: error.message });
        }

        console.log("Upload successful:", data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        console.log(`Public URL generated: ${publicUrl}`);
        res.json({ imageUrl: publicUrl });
    } catch (error: any) {
        console.error("Full upload handler error:", error);
        res.status(500).json({ error: "Image upload failed", message: error.message });
    }
});

export default router;
