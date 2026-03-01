import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeObject, apiError } from "@/lib/api-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;
        const body = await req.json();
        const sanitized = sanitizeObject(body, ["title", "description", "imageUrl", "categoryId", "order", "isVisible"]);

        // Remove undefined values
        Object.keys(sanitized).forEach(key => sanitized[key] === undefined && delete sanitized[key]);

        await adminDb.collection("GalleryItem").doc(id).update(sanitized);

        const doc = await adminDb.collection("GalleryItem").doc(id).get();
        return NextResponse.json(doc.data());
    } catch (error) {
        console.error("[Gallery ID API] PUT Error:", error);
        return apiError("Failed to update gallery item");
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;

        await adminDb.collection("GalleryItem").doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Gallery ID API] DELETE Error:", error);
        return apiError("Failed to delete gallery item");
    }
}
