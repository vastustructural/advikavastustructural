import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError, checkRateLimit, getClientIp } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { data, error } = await supabaseAdmin.from("ContactSubmission").select("*").order("createdAt", { ascending: false });
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Contact API] GET Error:", error);
        return apiError("Failed to fetch submissions");
    }
}

// Public endpoint — rate limited
export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        const { limited, errorResponse: rlErr } = checkRateLimit(`contact-${ip}`, 5, 60000);
        if (limited) return rlErr;

        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["name", "email", "message"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["name", "email", "phone", "subject", "message"]);

        const { data: submission, error } = await supabaseAdmin
            .from("ContactSubmission")
            .insert({
                id: nanoid(),
                name: sanitized.name,
                email: sanitized.email,
                phone: sanitized.phone || "",
                subject: sanitized.subject || "",
                message: sanitized.message,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(submission, { status: 201 });
    } catch (error) {
        console.error("[Contact API] POST Error:", error);
        return apiError("Failed to submit contact form");
    }
}
