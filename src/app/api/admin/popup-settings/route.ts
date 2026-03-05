import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeObject, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        // Public endpoint - no auth required for reading popup settings
        const doc = await adminDb.collection("AppSettings").doc("welcome_popup").get();
        if (doc.exists) {
            return NextResponse.json(doc.data());
        }
        // Return defaults if not configured
        return NextResponse.json(getDefaultSettings());
    } catch (error) {
        console.error("[PopupSettings] GET Error:", error);
        return NextResponse.json(getDefaultSettings());
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const body = await req.json();
        const sanitized = sanitizeObject(body, ["title", "subtitle", "message", "badge"]);

        const data = {
            ...sanitized,
            primaryButtonText: body.primaryButtonText || "Explore Free Tools",
            primaryButtonUrl: body.primaryButtonUrl || "/tools",
            secondaryButtonText: body.secondaryButtonText || "Get Expert Advice",
            secondaryButtonUrl: body.secondaryButtonUrl || "/contact",
            isEnabled: body.isEnabled !== false,
            updatedAt: new Date().toISOString(),
        };

        await adminDb.collection("AppSettings").doc("welcome_popup").set(data, { merge: true });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("[PopupSettings] POST Error:", error);
        return apiError("Failed to save popup settings");
    }
}

function getDefaultSettings() {
    return {
        title: "Welcome to Advika Vastu-Structural",
        subtitle: "Your Dream Home Experts",
        badge: "✨ Trusted Across India",
        message: "Get expert architectural planning, Vastu-compliant designs, and structural consultancy — all tailored for your dream home project.",
        primaryButtonText: "Explore Free Tools",
        primaryButtonUrl: "/tools",
        secondaryButtonText: "Get Expert Advice",
        secondaryButtonUrl: "/contact",
        isEnabled: true,
    };
}
