import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeObject, apiError } from "@/lib/api-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;
        const body = await req.json();
        const sanitized = sanitizeObject(body, ["title", "description", "imageUrl", "categoryId", "order", "isVisible"]);

        const { data: item, error } = await supabaseAdmin
            .from("GalleryItem")
            .update(sanitized)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(item);
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

        const { error } = await supabaseAdmin
            .from("GalleryItem")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Gallery ID API] DELETE Error:", error);
        return apiError("Failed to delete gallery item");
    }
}
