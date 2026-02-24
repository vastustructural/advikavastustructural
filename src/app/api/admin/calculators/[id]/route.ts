import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeObject, apiError } from "@/lib/api-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;
        const body = await req.json();

        const sanitized = sanitizeObject(body, ["name", "description", "resultLabel", "resultUnit"]);
        const updateData: Record<string, any> = {
            ...sanitized,
            fields: body.fields,
            formula: body.formula,
            order: body.order,
            isVisible: body.isVisible,
        };

        if (sanitized.name) {
            updateData.slug = sanitized.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        }

        const { data, error } = await supabaseAdmin
            .from("Calculator")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Calculator ID API] PUT Error:", error);
        return apiError("Failed to update calculator");
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from("Calculator")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Calculator ID API] DELETE Error:", error);
        return apiError("Failed to delete calculator");
    }
}
