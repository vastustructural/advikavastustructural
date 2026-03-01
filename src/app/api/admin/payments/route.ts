import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";

// GET — List all payments with optional filters
export async function GET(req: Request) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search")?.toLowerCase();

        let paymentsQuery: FirebaseFirestore.Query = adminDb.collection("Payment");

        if (status && status !== "ALL") {
            paymentsQuery = paymentsQuery.where("status", "==", status);
        }

        const paymentsSnap = await paymentsQuery.get();
        let payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        // Sort by createdAt desc in memory to avoid requiring a composite index
        payments.sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
        });

        if (search) {
            payments = payments.filter((p: any) =>
                (p.userName && p.userName.toLowerCase().includes(search)) ||
                (p.userEmail && p.userEmail.toLowerCase().includes(search)) ||
                (p.userPhone && p.userPhone.toLowerCase().includes(search)) ||
                (p.razorpayOrderId && p.razorpayOrderId.toLowerCase().includes(search)) ||
                (p.razorpayPaymentId && p.razorpayPaymentId.toLowerCase().includes(search))
            );
        }

        // Fetch referrers to gather referrer name, phone, etc.
        const referrersSnap = await adminDb.collection("Referrer").get();
        const referrersMap = new Map();
        referrersSnap.docs.forEach(doc => {
            const data = doc.data();
            referrersMap.set(doc.id, { name: data.name, phone: data.phone, referralCode: data.referralCode });
        });

        payments = payments.map(p => ({
            ...p,
            referrer: p.referrerId ? referrersMap.get(p.referrerId) : null
        }));

        // Summary stats
        const allPaymentsSnap = await adminDb.collection("Payment").get();
        const allPayments = allPaymentsSnap.docs.map(doc => doc.data() as any);

        const totalRevenue = allPayments
            .filter((p: any) => p.status === "PAID")
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

        const totalPaid = allPayments.filter((p: any) => p.status === "PAID").length;
        const totalPending = allPayments.filter((p: any) => p.status === "PENDING").length;
        const totalFailed = allPayments.filter((p: any) => p.status === "FAILED").length;

        return NextResponse.json({
            payments,
            stats: {
                totalRevenue,
                totalPaid,
                totalPending,
                totalFailed,
                total: allPayments.length,
            },
        });
    } catch (error: any) {
        console.error("[Payments Admin API] GET Error:", error);
        return apiError("Failed to fetch payments");
    }
}
