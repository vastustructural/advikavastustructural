import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const catSnap = await adminDb.collection("GalleryCategory").orderBy("order", "asc").get();
        const categories = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const itemsSnap = await adminDb.collection("GalleryItem").orderBy("order", "asc").get();

        const categoryMap = new Map(categories.map((c: any) => [c.id, c]));
        const items = itemsSnap.docs.map(doc => {
            const item = { id: doc.id, ...doc.data() } as any;
            item.category = categoryMap.get(item.categoryId);
            return item;
        });

        return NextResponse.json({ items, categories });
    } catch (error) {
        console.error("[Gallery API] GET Error:", error);
        return apiError("Failed to fetch gallery");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["categoryId"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["title", "description", "imageUrl"]);

        const newId = nanoid();
        const galleryItem = {
            id: newId,
            title: sanitized.title || "New Item",
            description: sanitized.description || "",
            imageUrl: sanitized.imageUrl || "",
            categoryId: body.categoryId,
            order: body.order ?? 0,
            isVisible: body.isVisible ?? true,
        };

        await adminDb.collection("GalleryItem").doc(newId).set(galleryItem);

        return NextResponse.json(galleryItem, { status: 201 });
    } catch (error) {
        console.error("[Gallery API] POST Error:", error);
        return apiError("Failed to create gallery item");
    }
}
