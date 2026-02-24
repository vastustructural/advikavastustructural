import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { data, error } = await supabaseAdmin.from("CTASection").select("*").order("order", { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("[CTA API] GET Error:", error);
        return apiError("Failed to fetch CTA sections");
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();

        let targetId = body.id;

        if (!targetId) {
            // Find first CTA section if no ID provided
            const { data: existing } = await supabaseAdmin.from("CTASection").select("id").limit(1).maybeSingle();
            if (existing) {
                targetId = existing.id;
            } else {
                targetId = nanoid();
            }
        }

        const { data: section, error } = await supabaseAdmin
            .from("CTASection")
            .upsert({
                id: targetId,
                headline: body.headline || "Get Your Dream Project Started",
                subtext: body.subtext || "",
                buttonText: body.buttonText || "Get Started",
                buttonUrl: body.buttonUrl || "/contact",
                isVisible: body.isVisible ?? true,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(section);
    } catch (error) {
        console.error("[CTA API] PUT Error:", error);
        return apiError("Failed to update CTA section");
    }
}
