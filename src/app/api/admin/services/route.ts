import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { data, error } = await supabaseAdmin.from("Service").select("*").order("order", { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Services API] GET Error:", error);
        return apiError("Failed to fetch services");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const body = await req.json();
        const { valid, errorResponse: validationError } = validateFields(body, ["title"]);
        if (!valid) return validationError;

        const sanitized = sanitizeObject(body, ["title", "description", "price", "originalPrice", "sampleImageUrl", "icon"]);
        const slugBase = sanitized.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        const { data: service, error } = await supabaseAdmin
            .from("Service")
            .insert({
                id: nanoid(),
                title: sanitized.title,
                slug: `${slugBase}-${Date.now()}`,
                description: sanitized.description || "",
                icon: sanitized.icon || "📋",
                price: sanitized.price || null,
                originalPrice: sanitized.originalPrice || null,
                sampleImageUrl: sanitized.sampleImageUrl || null,
                inclusions: Array.isArray(body.inclusions) ? body.inclusions : [],
                processSteps: Array.isArray(body.processSteps) ? body.processSteps : [],
                deliverables: Array.isArray(body.deliverables) ? body.deliverables : [],
                order: body.order ?? 0,
                isVisible: body.isVisible ?? true,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(service, { status: 201 });
    } catch (error) {
        console.error("[Services API] POST Error:", error);
        return apiError("Failed to create service");
    }
}
