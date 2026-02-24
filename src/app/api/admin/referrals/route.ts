import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        // Fetch referrers with their PAID payments
        const { data: referrers, error } = await supabaseAdmin
            .from("Referrer")
            .select(`
                *,
                payments:Payment(
                    amount
                )
            `)
            .eq("payments.status", "PAID")
            .order("createdAt", { ascending: false });

        if (error) throw error;

        const formattedReferrers = (referrers || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            phone: r.phone,
            referralCode: r.referralCode,
            successfulReferrals: r.payments?.length || 0,
            totalRevenue: r.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0,
            createdAt: r.createdAt
        }));

        return NextResponse.json(formattedReferrers);
    } catch (error) {
        console.error("[Referrals Admin API] GET Error:", error);
        return apiError("Failed to fetch referral data");
    }
}
