import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const referrersSnap = await adminDb.collection("Referrer").orderBy("createdAt", "desc").get();
        const referrers = referrersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const paymentsSnap = await adminDb.collection("Payment").where("status", "==", "PAID").get();
        const payments = paymentsSnap.docs.map(doc => doc.data());

        const formattedReferrers = referrers.map((r: any) => {
            const rPayments = payments.filter((p: any) => p.referrerId === r.id);
            return {
                id: r.id,
                name: r.name,
                phone: r.phone,
                referralCode: r.referralCode,
                successfulReferrals: rPayments.length,
                totalRevenue: rPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
                createdAt: r.createdAt
            };
        });

        return NextResponse.json(formattedReferrers);
    } catch (error) {
        console.error("[Referrals Admin API] GET Error:", error);
        return apiError("Failed to fetch referral data");
    }
}
