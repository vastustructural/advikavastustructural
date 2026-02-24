import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeObject, apiError } from "@/lib/api-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;
        const body = await req.json();

        const sanitizedData = sanitizeObject(body, ["name", "description", "price", "originalPrice", "imageUrl", "category", "area", "direction", "bhk", "vastu", "code"]);
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

        const { data: product, error } = await supabaseAdmin
            .from("Product")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(product);
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

        const { error } = await supabaseAdmin
            .from("Product")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Product ID API] DELETE Error:", error);
        return apiError("Failed to delete product");
    }
}
