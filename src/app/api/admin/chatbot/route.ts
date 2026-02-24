import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const { data: sessions, error } = await supabaseAdmin
            .from("ChatSession")
            .select("*, messages:ChatMessage(*)")
            .order("createdAt", { ascending: false })
            .limit(100);

        if (error) throw error;

        // Sort messages manually as Supabase order on nested select is complex
        const formattedSessions = sessions?.map(session => ({
            ...session,
            messages: (session.messages || []).sort((a: any, b: any) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
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

        const { error } = await supabaseAdmin
            .from("ChatSession")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Chatbot Admin API] DELETE Error:", error);
        return apiError("Failed to delete chat session");
    }
}
