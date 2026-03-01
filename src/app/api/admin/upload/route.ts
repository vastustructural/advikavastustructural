import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";
import { v2 as cloudinary } from "cloudinary";
import { nanoid } from "nanoid";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip", "application/x-zip-compressed", "application/octet-stream"
];

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        // Verify configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return apiError("Cloudinary configuration missing in .env file. Please check your credentials.", 500);
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "general";

        if (!file) {
            return apiError("No file provided", 400);
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return apiError("Invalid file type. Allowed: Images, PDFs, DOCs, or ZIPs", 400);
        }

        if (file.size > MAX_FILE_SIZE) {
            return apiError("File too large. Maximum size is 5MB", 400);
        }

        // Convert file to buffer and then to Base64 to prevent stream corruption on raw files
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');
        const fileUri = `data:${file.type};base64,${base64Data}`;

        const isImage = file.type.startsWith("image/");
        const ext = file.name ? file.name.split('.').pop()?.toLowerCase() : undefined;
        const uniqueId = nanoid();

        // Upload to Cloudinary using standard upload with Base64
        const uploadResult = await cloudinary.uploader.upload(fileUri, {
            folder: `advika/${folder}`,
            // If it's a raw file, we MUST append the extension to the public_id
            public_id: ext && !isImage ? `${uniqueId}.${ext}` : uniqueId,
            resource_type: isImage ? "image" : "raw",
        });

        // @ts-ignore
        const publicUrl = uploadResult.secure_url;

        return NextResponse.json({
            url: publicUrl,
            // @ts-ignore
            path: uploadResult.public_id,
        });

    } catch (error: any) {
        console.error("Upload error:", error);
        return apiError(`Upload failed: ${error.message || 'Unknown error'}`, 500);
    }
}
