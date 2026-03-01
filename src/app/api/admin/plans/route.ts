import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const snapshot = await adminDb.collection("Plan").orderBy("order", "asc").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Plans API] GET Error:", error);
        return apiError("Failed to fetch plans");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["name", "price"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["name", "description"]);

        const newId = nanoid();
        const planData = {
            id: newId,
            name: sanitized.name,
            slug: sanitized.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
            description: sanitized.description || "",
            price: body.price,
            features: body.features || [],
            timeline: body.timeline || "",
            isFeatured: body.isFeatured ?? false,
            order: body.order ?? 0,
            isVisible: body.isVisible ?? true,
        };

        await adminDb.collection("Plan").doc(newId).set(planData);

        return NextResponse.json(planData, { status: 201 });
    } catch (error) {
        console.error("[Plans API] POST Error:", error);
        return apiError("Failed to create plan");
    }
}
