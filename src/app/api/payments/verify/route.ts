import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { z } from "zod";

const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = verifyPaymentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid verification data" }, { status: 400 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;
        const signBody = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(signBody.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update payment in database
            const paymentSnap = await adminDb.collection("Payment").where("razorpayOrderId", "==", razorpay_order_id).limit(1).get();

            if (!paymentSnap.empty) {
                await adminDb.collection("Payment").doc(paymentSnap.docs[0].id).update({
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: "PAID",
                });
            }

            return NextResponse.json({ message: "Payment verified successfully" });
        } else {
            // Update payment as failed
            const paymentSnap = await adminDb.collection("Payment").where("razorpayOrderId", "==", razorpay_order_id).limit(1).get();

            if (!paymentSnap.empty) {
                await adminDb.collection("Payment").doc(paymentSnap.docs[0].id).update({ status: "FAILED" });
            }

            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Razorpay Verification Error:", error);
        return NextResponse.json({ error: "Verification failed internally" }, { status: 500 });
    }
}
