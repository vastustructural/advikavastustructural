import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;
        const body = await req.json();

        const { data, error } = await supabaseAdmin
            .from("ContactSubmission")
            .update({ isRead: body.isRead ?? true })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Contact ID API] PUT Error:", error);
        return apiError("Failed to update submission");
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from("ContactSubmission")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Contact ID API] DELETE Error:", error);
        return apiError("Failed to delete submission");
    }
}
