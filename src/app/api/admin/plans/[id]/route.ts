import { supabaseAdmin } from "@/lib/supabase";
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

        const { data, error } = await supabaseAdmin
            .from("Plan")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
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

        const { error } = await supabaseAdmin
            .from("Plan")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Plan ID API] DELETE Error:", error);
        return apiError("Failed to delete plan");
    }
}
