import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["name"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["name"]);

        const newId = nanoid();
        const category = {
            id: newId,
            name: sanitized.name,
            order: body.order ?? 0,
        };

        await adminDb.collection("GalleryCategory").doc(newId).set(category);

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("[Gallery Category API] POST Error:", error);
        return apiError("Failed to create gallery category");
    }
}
