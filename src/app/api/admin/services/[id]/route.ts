import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeObject, apiError } from "@/lib/api-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;
        const body = await req.json();

        const sanitized = sanitizeObject(body, ["title", "description", "price", "originalPrice", "sampleImageUrl", "sampleDocumentUrl", "icon"]);
        const updateData: Record<string, any> = {};

        if (sanitized.title !== undefined) {
            updateData.title = sanitized.title;
            const slugBase = sanitized.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            updateData.slug = `${slugBase}-${id.slice(-6)}`;
        }
        if (sanitized.description !== undefined) updateData.description = sanitized.description;
        if (sanitized.icon !== undefined) updateData.icon = sanitized.icon;
        if (sanitized.price !== undefined) updateData.price = sanitized.price || null;
        if (sanitized.originalPrice !== undefined) updateData.originalPrice = sanitized.originalPrice || null;
        if (sanitized.sampleImageUrl !== undefined) updateData.sampleImageUrl = sanitized.sampleImageUrl || null;
        if (sanitized.sampleDocumentUrl !== undefined) updateData.sampleDocumentUrl = sanitized.sampleDocumentUrl || null;

        if (body.inclusions !== undefined) updateData.inclusions = Array.isArray(body.inclusions) ? body.inclusions : [];
        if (body.processSteps !== undefined) updateData.processSteps = Array.isArray(body.processSteps) ? body.processSteps : [];
        if (body.deliverables !== undefined) updateData.deliverables = Array.isArray(body.deliverables) ? body.deliverables : [];
        if (body.isVisible !== undefined) updateData.isVisible = body.isVisible;
        if (body.order !== undefined) updateData.order = body.order;

        await adminDb.collection("Service").doc(id).update(updateData);

        const doc = await adminDb.collection("Service").doc(id).get();
        return NextResponse.json(doc.data());
    } catch (error) {
        console.error("[Service ID API] PUT Error:", error);
        return apiError("Failed to update service");
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;

        await adminDb.collection("Service").doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Service ID API] DELETE Error:", error);
        return apiError("Failed to delete service");
    }
}
