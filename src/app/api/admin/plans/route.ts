import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { data, error } = await supabaseAdmin.from("Plan").select("*").order("order", { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Plans API] GET Error:", error);
        return apiError("Failed to fetch plans");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["name", "price"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["name", "description"]);

        const { data: plan, error } = await supabaseAdmin
            .from("Plan")
            .insert({
                id: nanoid(),
                name: sanitized.name,
                slug: sanitized.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                description: sanitized.description || "",
                price: body.price,
                features: body.features || [],
                timeline: body.timeline || "",
                isFeatured: body.isFeatured ?? false,
                order: body.order ?? 0,
                isVisible: body.isVisible ?? true,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(plan, { status: 201 });
    } catch (error) {
        console.error("[Plans API] POST Error:", error);
        return apiError("Failed to create plan");
    }
}
