import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const { data: categories, error: catError } = await supabaseAdmin
            .from("GalleryCategory")
            .select("*")
            .order("order", { ascending: true });

        if (catError) throw catError;

        const { data: items, error: itemError } = await supabaseAdmin
            .from("GalleryItem")
            .select("*, category:GalleryCategory(*)")
            .order("order", { ascending: true });

        if (itemError) throw itemError;

        return NextResponse.json({ items, categories });
    } catch (error) {
        console.error("[Gallery API] GET Error:", error);
        return apiError("Failed to fetch gallery");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["categoryId"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["title", "description", "imageUrl"]);

        const { data: item, error } = await supabaseAdmin
            .from("GalleryItem")
            .insert({
                id: nanoid(),
                title: sanitized.title || "New Item",
                description: sanitized.description || "",
                imageUrl: sanitized.imageUrl || "",
                categoryId: body.categoryId,
                order: body.order ?? 0,
                isVisible: body.isVisible ?? true,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("[Gallery API] POST Error:", error);
        return apiError("Failed to create gallery item");
    }
}
