import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { data, error } = await supabaseAdmin.from("Calculator").select("*").order("order", { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Calculators API] GET Error:", error);
        return apiError("Failed to fetch calculators");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["name", "formula"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["name", "description", "resultLabel", "resultUnit"]);

        const { data: calculator, error } = await supabaseAdmin
            .from("Calculator")
            .insert({
                id: nanoid(),
                name: sanitized.name,
                slug: sanitized.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                description: sanitized.description || "",
                fields: body.fields || [],
                formula: body.formula,
                resultLabel: sanitized.resultLabel || "Estimated Result",
                resultUnit: sanitized.resultUnit || "₹",
                order: body.order ?? 0,
                isVisible: body.isVisible ?? true,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(calculator, { status: 201 });
    } catch (error) {
        console.error("[Calculators API] POST Error:", error);
        return apiError("Failed to create calculator");
    }
}
