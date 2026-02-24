import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
        }

        const { name, phone } = validation.data;

        // Check if phone already registered
        const { data: existingReferrer, error: findError } = await supabaseAdmin
            .from("Referrer")
            .select("*")
            .eq("phone", phone)
            .maybeSingle();

        let referrer = existingReferrer;

        if (!referrer) {
            // Generate unique referral code
            const referralCode = nanoid(8).toUpperCase();

            const { data: newReferrer, error: insertError } = await supabaseAdmin
                .from("Referrer")
                .insert({
                    id: nanoid(),
                    name,
                    phone,
                    referralCode
                })
                .select()
                .single();

            if (insertError) throw insertError;
            referrer = newReferrer;
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const referralLink = `${baseUrl}?ref=${referrer.referralCode}`;

        return NextResponse.json({
            referrer,
            referralLink
        });

    } catch (error: any) {
        console.error("Referral Registration Error:", error);
        return NextResponse.json({ error: "Failed to register referral" }, { status: 500 });
    }
}
