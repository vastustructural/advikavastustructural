import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const sessionsSnap = await adminDb.collection("ChatSession")
            .orderBy("createdAt", "desc")
            .limit(100)
            .get();

        const sessions = sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const formattedSessions = await Promise.all(sessions.map(async (session: any) => {
            const messagesSnap = await adminDb.collection("ChatMessage")
                .where("sessionId", "==", session.id)
                .get();

            const messages = messagesSnap.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as any))
                .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

            return {
                ...session,
                messages
            };
        }));

        return NextResponse.json(formattedSessions);
    } catch (error) {
        console.error("[Chatbot Admin API] GET Error:", error);
        return apiError("Failed to fetch chat sessions");
    }
}

export async function DELETE(req: Request) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return apiError("Session ID is required", 400);

        await adminDb.collection("ChatSession").doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Chatbot Admin API] DELETE Error:", error);
        return apiError("Failed to delete chat session");
    }
}
