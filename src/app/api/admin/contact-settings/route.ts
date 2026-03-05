import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { requireAuth, apiError, validateFields, sanitizeObject } from "@/lib/api-utils";

export async function GET(req: Request) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        // Note: The UI settings might be public without auth in a separate endpoint later,
        // but this GET is specific for the Admin Editor to fetch values reliably.
        const settingsRef = adminDb.collection("AppSettings").doc("contact_settings");
        const doc = await settingsRef.get();

        if (!doc.exists) {
            return NextResponse.json({
                email: "admin@advikavastustructural.com",
                phone: "+91-9284242634",
                address: "Plot No -04, Om Sai Nagar, Besa, / Nagpur - 440027",
                workingHours: "Monday - Saturday: / 10:00 AM - 6:00 PM",
                socialLinks: { facebook: "", instagram: "", linkedin: "", twitter: "" }
            });
        }

        return NextResponse.json(doc.data());
    } catch (error) {
        console.error("[Contact Settings API] GET Error:", error);
        return apiError("Failed to fetch contact settings");
    }
}

export async function POST(req: Request) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const body = await req.json();
        const { valid, errorResponse: fieldError } = validateFields(body, ["email", "phone", "address", "workingHours"]);
        if (!valid) return fieldError;

        const sanitized = sanitizeObject(body, ["email", "phone", "address", "workingHours"]);

        // Handle nested socialLinks gracefully
        const socialLinks = body.socialLinks || {};

        const settingsData = {
            ...sanitized,
            socialLinks: {
                facebook: socialLinks.facebook || "",
                instagram: socialLinks.instagram || "",
                linkedin: socialLinks.linkedin || "",
                twitter: socialLinks.twitter || "",
            },
            updatedAt: new Date().toISOString(),
        };

        await adminDb.collection("AppSettings").doc("contact_settings").set(settingsData, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Contact Settings API] POST Error:", error);
        return apiError("Failed to update contact settings");
    }
}
