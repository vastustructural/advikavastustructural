import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { apiError, checkRateLimit, getClientIp } from "@/lib/api-utils";
import { nanoid } from "nanoid";

// ─── Chat API — Session & Message Storage ─────────────
// This API only manages session creation and message persistence

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        const { limited, errorResponse } = checkRateLimit(`chat-${ip}`, 30, 600000);
        if (limited) return errorResponse;

        const body = await req.json();
        const { action, sessionId, role, content, guestName, phone } = body;

        // ─── Create Session ───────────────────────────
        if (action === "create-session") {
            const { data, error } = await supabaseAdmin
                .from("ChatSession")
                .insert({
                    id: nanoid(),
                    ipAddress: ip,
                    guestName: guestName || null,
                    phone: phone || null,
                })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ sessionId: data.id });
        }

        // ─── Store Message ────────────────────────────
        if (action === "store-message") {
            if (!sessionId || !role || !content) {
                return apiError("sessionId, role, and content are required", 400);
            }
            const { error } = await supabaseAdmin
                .from("ChatMessage")
                .insert({
                    id: nanoid(),
                    sessionId,
                    role,
                    content
                });

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        // ─── Get History ──────────────────────────────
        if (action === "get-history") {
            if (!sessionId) return apiError("sessionId is required", 400);
            const { data, error } = await supabaseAdmin
                .from("ChatMessage")
                .select("*")
                .eq("sessionId", sessionId)
                .order("createdAt", { ascending: true });

            if (error) throw error;
            return NextResponse.json({ messages: data });
        }

        return apiError("Invalid action", 400);
    } catch (error) {
        console.error("[Chat API] Error:", error);
        return apiError("Chat error");
    }
}
