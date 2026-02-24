import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, sanitizeObject, apiError } from "@/lib/api-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;
        const body = await req.json();
        const sanitized = sanitizeObject(body, ["name", "content", "role", "company"]);

        const { data, error } = await supabaseAdmin
            .from("Testimonial")
            .update({
                name: sanitized.name,
                role: sanitized.role || "",
                company: sanitized.company || "",
                content: sanitized.content,
                rating: body.rating,
                imageUrl: body.imageUrl,
                order: body.order,
                isVisible: body.isVisible,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
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

        const { error } = await supabaseAdmin
            .from("Testimonial")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Testimonial ID API] DELETE Error:", error);
        return apiError("Failed to delete testimonial");
    }
}
