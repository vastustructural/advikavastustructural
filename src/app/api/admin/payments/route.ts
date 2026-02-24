import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";

// GET — List all payments with optional filters
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        let query = supabaseAdmin
            .from("Payment")
            .select("*, referrer:Referrer(name, phone, referralCode)");

        if (status && status !== "ALL") {
            query = query.eq("status", status);
        }

        if (search) {
            query = query.or(`userName.ilike.%${search}%,userEmail.ilike.%${search}%,userPhone.ilike.%${search}%,razorpayOrderId.ilike.%${search}%,razorpayPaymentId.ilike.%${search}%`);
        }

        const { data: payments, error } = await query.order("createdAt", { ascending: false });
        if (error) throw error;

        // Summary stats
        const { data: allPayments, error: statsError } = await supabaseAdmin
            .from("Payment")
            .select("status, amount");

        if (statsError) throw statsError;

        const totalRevenue = (allPayments || [])
            .filter((p: any) => p.status === "PAID")
            .reduce((sum: number, p: any) => sum + p.amount, 0);

        const totalPaid = (allPayments || []).filter((p: any) => p.status === "PAID").length;
        const totalPending = (allPayments || []).filter((p: any) => p.status === "PENDING").length;
        const totalFailed = (allPayments || []).filter((p: any) => p.status === "FAILED").length;

        return NextResponse.json({
            payments,
            stats: {
                totalRevenue,
                totalPaid,
                totalPending,
                totalFailed,
                total: allPayments?.length || 0,
            },
        });
    } catch (error: any) {
        console.error("[Payments Admin API] GET Error:", error);
        return apiError("Failed to fetch payments");
    }
}
