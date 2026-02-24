import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { data, error } = await supabaseAdmin.from("LegalPage").select("*");
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Legal API] GET Error:", error);
        return apiError("Failed to fetch legal pages");
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();

        const { data, error } = await supabaseAdmin
            .from("LegalPage")
            .update({ title: body.title, content: body.content })
            .eq("slug", body.slug)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Legal API] PUT Error:", error);
        return apiError("Failed to update legal page");
    }
}
