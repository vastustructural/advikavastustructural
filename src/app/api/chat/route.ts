import { adminDb } from "@/lib/firebase-admin";
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
            const newId = nanoid();
            await adminDb.collection("ChatSession").doc(newId).set({
                id: newId,
                ipAddress: ip,
                guestName: guestName || null,
                phone: phone || null,
                createdAt: new Date().toISOString()
            });

            return NextResponse.json({ sessionId: newId });
        }

        // ─── Store Message ────────────────────────────
        if (action === "store-message") {
            if (!sessionId || !role || !content) {
                return apiError("sessionId, role, and content are required", 400);
            }
            const newId = nanoid();
            await adminDb.collection("ChatMessage").doc(newId).set({
                id: newId,
                sessionId,
                role,
                content,
                createdAt: new Date().toISOString()
            });

            return NextResponse.json({ success: true });
        }

        // ─── Get History ──────────────────────────────
        if (action === "get-history") {
            if (!sessionId) return apiError("sessionId is required", 400);

            const snapshot = await adminDb.collection("ChatMessage")
                .where("sessionId", "==", sessionId)
                .get();

            const data = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as any))
                .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

            return NextResponse.json({ messages: data });
        }

        return apiError("Invalid action", 400);
    } catch (error) {
        console.error("[Chat API] Error:", error);
        return apiError("Chat error");
    }
}
