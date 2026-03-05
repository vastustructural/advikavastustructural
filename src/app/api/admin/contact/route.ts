import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError, checkRateLimit, getClientIp } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const snapshot = await adminDb.collection("ContactSubmission").orderBy("createdAt", "desc").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Contact API] GET Error:", error);
        return apiError("Failed to fetch submissions");
    }
}

// Public endpoint — rate limited
export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        const { limited, errorResponse: rlErr } = checkRateLimit(`contact-${ip}`, 5, 60000);
        if (limited) return rlErr;

        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["name", "email", "message"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["name", "email", "phone", "subject", "message"]);

        const newId = nanoid();
        const submissionData = {
            id: newId,
            name: sanitized.name,
            email: sanitized.email,
            phone: sanitized.phone || "",
            subject: sanitized.subject || "",
            message: sanitized.message,
            createdAt: new Date().toISOString(),
        };

        await adminDb.collection("ContactSubmission").doc(newId).set(submissionData);

        return NextResponse.json(submissionData, { status: 201 });
    } catch (error) {
        console.error("[Contact API] POST Error:", error);
        return apiError("Failed to submit contact form");
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return apiError("Submission ID is required", 400);

        await adminDb.collection("ContactSubmission").doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Contact API] DELETE Error:", error);
        return apiError("Failed to delete submission");
    }
}
