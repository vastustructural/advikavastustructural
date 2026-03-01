import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeObject, apiError } from "@/lib/api-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;
        const body = await req.json();
        const sanitized = sanitizeObject(body, ["name", "content", "role", "company"]);

        const updateData: Record<string, any> = {
            name: sanitized.name,
            role: sanitized.role || "",
            company: sanitized.company || "",
            content: sanitized.content,
            rating: body.rating,
            imageUrl: body.imageUrl,
            order: body.order,
            isVisible: body.isVisible,
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        await adminDb.collection("Testimonial").doc(id).update(updateData);

        const doc = await adminDb.collection("Testimonial").doc(id).get();
        return NextResponse.json(doc.data());
    } catch (error) {
        console.error("[Testimonial ID API] PUT Error:", error);
        return apiError("Failed to update testimonial");
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;

        await adminDb.collection("Testimonial").doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Testimonial ID API] DELETE Error:", error);
        return apiError("Failed to delete testimonial");
    }
}
