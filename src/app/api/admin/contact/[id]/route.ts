import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;
        const body = await req.json();

        await adminDb.collection("ContactSubmission").doc(id).update({ isRead: body.isRead ?? true });

        const doc = await adminDb.collection("ContactSubmission").doc(id).get();
        return NextResponse.json(doc.data());
    } catch (error) {
        console.error("[Contact ID API] PUT Error:", error);
        return apiError("Failed to update submission");
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const { id } = await params;

        await adminDb.collection("ContactSubmission").doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Contact ID API] DELETE Error:", error);
        return apiError("Failed to delete submission");
    }
}
