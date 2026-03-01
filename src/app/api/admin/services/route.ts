import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const snapshot = await adminDb.collection("Service").orderBy("order", "asc").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Services API] GET Error:", error);
        return apiError("Failed to fetch services");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const body = await req.json();
        const { valid, errorResponse: validationError } = validateFields(body, ["title"]);
        if (!valid) return validationError;

        const sanitized = sanitizeObject(body, ["title", "description", "price", "originalPrice", "sampleImageUrl", "sampleDocumentUrl", "icon"]);
        const slugBase = sanitized.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        const newId = nanoid();
        const serviceData = {
            id: newId,
            title: sanitized.title,
            slug: `${slugBase}-${Date.now()}`,
            description: sanitized.description || "",
            icon: sanitized.icon || "📋",
            price: sanitized.price || null,
            originalPrice: sanitized.originalPrice || null,
            sampleImageUrl: sanitized.sampleImageUrl || null,
            sampleDocumentUrl: sanitized.sampleDocumentUrl || null,
            inclusions: Array.isArray(body.inclusions) ? body.inclusions : [],
            processSteps: Array.isArray(body.processSteps) ? body.processSteps : [],
            deliverables: Array.isArray(body.deliverables) ? body.deliverables : [],
            order: body.order ?? 0,
            isVisible: body.isVisible ?? true,
        };

        await adminDb.collection("Service").doc(newId).set(serviceData);

        return NextResponse.json(serviceData, { status: 201 });
    } catch (error) {
        console.error("[Services API] POST Error:", error);
        return apiError("Failed to create service");
    }
}
