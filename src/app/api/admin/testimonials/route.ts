import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const snapshot = await adminDb.collection("Testimonial").orderBy("order", "asc").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Testimonials API] GET Error:", error);
        return apiError("Failed to fetch testimonials");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["name", "content"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["name", "content", "role", "company"]);

        const newId = nanoid();
        const testimonialData = {
            id: newId,
            name: sanitized.name,
            role: sanitized.role || "",
            company: sanitized.company || "",
            content: sanitized.content,
            rating: body.rating ?? 5,
            imageUrl: body.imageUrl || "",
            order: body.order ?? 0,
            isVisible: body.isVisible ?? true,
        };

        await adminDb.collection("Testimonial").doc(newId).set(testimonialData);

        return NextResponse.json(testimonialData, { status: 201 });
    } catch (error) {
        console.error("[Testimonials API] POST Error:", error);
        return apiError("Failed to create testimonial");
    }
}
