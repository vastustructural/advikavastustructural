import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const { data: rows, error } = await supabaseAdmin
            .from("GlobalSettings")
            .select("*");

        if (error) throw error;

        const settings: Record<string, any> = {};
        for (const row of rows || []) {
            settings[row.key] = row.value;
        }
        return NextResponse.json(settings);
    } catch (error) {
        console.error("[Settings API] GET Error:", error);
        return apiError("Failed to fetch settings");
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();

        const updates = Object.entries(body).map(([key, value]) => ({
            key,
            value: value as any
        }));

        const { data, error } = await supabaseAdmin
            .from("GlobalSettings")
            .upsert(updates)
            .select();

        if (error) throw error;
        return NextResponse.json({ success: true, updated: data?.length || 0 });
    } catch (error) {
        console.error("[Settings API] PUT Error:", error);
        return apiError("Failed to update settings");
    }
}
