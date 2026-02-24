import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { data, error } = await supabaseAdmin.from("Product").select("*").order("order", { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Products API] GET Error:", error);
        return apiError("Failed to fetch products");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["name"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["name", "description", "originalPrice"]);

        const { data: product, error } = await supabaseAdmin
            .from("Product")
            .insert({
                id: nanoid(),
                name: sanitized.name,
                slug: sanitized.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                description: sanitized.description || "",
                price: body.price || "",
                originalPrice: sanitized.originalPrice || null,
                imageUrl: body.imageUrl || "",
                category: body.category || "",
                area: body.area || "",
                floors: body.floors ? parseInt(body.floors.toString()) : null,
                direction: body.direction || null,
                width: body.width ? parseFloat(body.width.toString()) : null,
                depth: body.depth ? parseFloat(body.depth.toString()) : null,
                bhk: body.bhk || null,
                vastu: body.vastu || "Doesn't Matter",
                code: body.code || null,
                order: body.order ?? 0,
                isVisible: body.isVisible ?? true,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("[Products API] POST Error:", error);
        return apiError("Failed to create product");
    }
}
