import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";
import { nanoid } from "nanoid";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

const createOrderSchema = z.object({
    amount: z.union([z.string(), z.number()]).transform((val) => {
        const num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.]/g, "")) : val;
        return num;
    }),
    currency: z.string().default("INR"),
    planId: z.string().optional(),
    productId: z.string().optional(),
    userEmail: z.string().email().optional().or(z.literal("")),
    userName: z.string().optional(),
    userPhone: z.string().optional(),
    referralCode: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = createOrderSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid request data", details: validation.error.format() }, { status: 400 });
        }

        const { amount, currency, planId, productId, userEmail, userName, userPhone, referralCode } = validation.data;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
        }

        // Amount in Razorpay is in paise (100 paise = 1 INR)
        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Check for referral
        let referrerId = null;
        if (referralCode) {
            const { data: referrer, error: referrerError } = await supabaseAdmin
                .from("Referrer")
                .select("id")
                .eq("referralCode", referralCode)
                .single();

            if (referrer && !referrerError) {
                referrerId = referrer.id;
            }
        }

        // Save payment record to database
        const { error: dbError } = await supabaseAdmin
            .from("Payment")
            .insert({
                id: nanoid(),
                razorpayOrderId: order.id,
                amount: amount,
                currency,
                status: "PENDING",
                userEmail: userEmail || null,
                userName: userName || null,
                userPhone: userPhone || null,
                planId: planId || null,
                productId: productId || null,
                referrerId: referrerId
            });

        if (dbError) throw dbError;

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Razorpay Order Creation Error:", error);
        return NextResponse.json({
            error: error.message || "Failed to create order",
            code: error.code || "ORDER_CREATION_FAILED"
        }, { status: 500 });
    }
}
