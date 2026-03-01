import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeObject, apiError } from "@/lib/api-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;
        const body = await req.json();

        const sanitizedData = sanitizeObject(body, ["name", "description", "price", "originalPrice", "imageUrl", "category", "area", "direction", "bhk", "vastu", "code", "downloadLink"]);
        const updateData: Record<string, any> = {
            ...sanitizedData,
            floors: body.floors !== undefined ? (body.floors ? parseInt(body.floors.toString()) : null) : undefined,
            width: body.width !== undefined ? (body.width ? parseFloat(body.width.toString()) : null) : undefined,
            depth: body.depth !== undefined ? (body.depth ? parseFloat(body.depth.toString()) : null) : undefined,
            isVisible: body.isVisible,
            order: body.order,
        };

        if (sanitizedData.name) {
            updateData.slug = sanitizedData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        }

        // Remove undefined values to avoid overwriting with undefined
        Object.keys(updateData).forEach(key => (updateData as any)[key] === undefined && delete (updateData as any)[key]);

        await adminDb.collection("Product").doc(id).update(updateData);

        const doc = await adminDb.collection("Product").doc(id).get();
        return NextResponse.json(doc.data());
    } catch (error) {
        console.error("[Product ID API] PUT Error:", error);
        return apiError("Failed to update product");
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;

        await adminDb.collection("Product").doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Product ID API] DELETE Error:", error);
        return apiError("Failed to delete product");
    }
}
