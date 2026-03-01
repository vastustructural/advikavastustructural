import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeObject, apiError } from "@/lib/api-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;
        const body = await req.json();

        const sanitized = sanitizeObject(body, ["name", "description"]);
        const updateData: Record<string, any> = {
            ...sanitized,
            price: body.price,
            features: body.features,
            timeline: body.timeline,
            isFeatured: body.isFeatured,
            order: body.order,
            isVisible: body.isVisible,
        };

        if (sanitized.name) {
            updateData.slug = sanitized.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        }

        // Remove undefined values
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        await adminDb.collection("Plan").doc(id).update(updateData);

        const doc = await adminDb.collection("Plan").doc(id).get();
        return NextResponse.json(doc.data());
    } catch (error) {
        console.error("[Plan ID API] PUT Error:", error);
        return apiError("Failed to update plan");
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;

        await adminDb.collection("Plan").doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Plan ID API] DELETE Error:", error);
        return apiError("Failed to delete plan");
    }
}
