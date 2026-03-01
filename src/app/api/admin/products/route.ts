import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const snapshot = await adminDb.collection("Product").orderBy("order", "asc").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Products API] GET Error:", error);
        return apiError("Failed to fetch products");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["name"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["name", "description", "originalPrice", "downloadLink"]);

        const newId = nanoid();
        const productData = {
            id: newId,
            name: sanitized.name,
            slug: sanitized.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
            description: sanitized.description || "",
            price: body.price || "",
            originalPrice: sanitized.originalPrice || null,
            imageUrl: body.imageUrl || "",
            category: body.category || "",
            area: body.area || "",
            floors: body.floors ? parseInt(body.floors.toString()) : null,
            direction: body.direction || null,
            width: body.width ? parseFloat(body.width.toString()) : null,
            depth: body.depth ? parseFloat(body.depth.toString()) : null,
            bhk: body.bhk || null,
            vastu: body.vastu || "Doesn't Matter",
            code: body.code || null,
            downloadLink: sanitized.downloadLink || null,
            order: body.order ?? 0,
            isVisible: body.isVisible ?? true,
        };

        await adminDb.collection("Product").doc(newId).set(productData);

        return NextResponse.json(productData, { status: 201 });
    } catch (error) {
        console.error("[Products API] POST Error:", error);
        return apiError("Failed to create product");
    }
}
