import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { data, error } = await supabaseAdmin.from("Testimonial").select("*").order("order", { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Testimonials API] GET Error:", error);
        return apiError("Failed to fetch testimonials");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["name", "content"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["name", "content", "role", "company"]);

        const { data: testimonial, error } = await supabaseAdmin
            .from("Testimonial")
            .insert({
                id: nanoid(),
                name: sanitized.name,
                role: sanitized.role || "",
                company: sanitized.company || "",
                content: sanitized.content,
                rating: body.rating ?? 5,
                imageUrl: body.imageUrl || "",
                order: body.order ?? 0,
                isVisible: body.isVisible ?? true,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(testimonial, { status: 201 });
    } catch (error) {
        console.error("[Testimonials API] POST Error:", error);
        return apiError("Failed to create testimonial");
    }
}
