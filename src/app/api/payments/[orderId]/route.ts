import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // We fetch the payment document using the razorpayOrderId
        // Since razorpayOrderId is not the document ID, we need to query for it
        const paymentRef = adminDb.collection("Payment");
        const snapshot = await paymentRef.where("razorpayOrderId", "==", orderId).limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const paymentDoc = snapshot.docs[0];
        const paymentData = paymentDoc.data();

        let downloadLink = null;
        if (paymentData.status === "SUCCESS" && paymentData.productId) {
            try {
                const productDoc = await adminDb.collection("Product").doc(paymentData.productId).get();
                if (productDoc.exists) {
                    downloadLink = productDoc.data()?.downloadLink || null;
                }
            } catch (err) {
                console.error("Failed to fetch product for downloadLink", err);
            }
        }

        // In a real app we might also fetch user details or product/plan details if we want a richer invoice, 
        // but for now we return the basic data.
        return NextResponse.json({
            id: paymentData.id,
            razorpayOrderId: paymentData.razorpayOrderId,
            amount: paymentData.amount,
            currency: paymentData.currency || "INR",
            status: paymentData.status,
            userEmail: paymentData.userEmail || "",
            userName: paymentData.userName || "",
            userPhone: paymentData.userPhone || "",
            planId: paymentData.planId || null,
            productId: paymentData.productId || null,
            downloadLink: downloadLink,
            createdAt: paymentData.createdAt || new Date().toISOString()
        });

    } catch (error: any) {
        console.error("Error fetching order details:", error);
        return NextResponse.json(
            { error: "Failed to fetch order details", details: error.message },
            { status: 500 }
        );
    }
}
