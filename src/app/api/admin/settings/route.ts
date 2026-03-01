import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const snapshot = await adminDb.collection("GlobalSettings").get();

        const settings: Record<string, any> = {};
        for (const doc of snapshot.docs) {
            const data = doc.data();
            // Try to match the schema. Either docId is the key or a 'key' field exists.
            const key = data.key || doc.id;
            settings[key] = data.value;
        }
        return NextResponse.json(settings);
    } catch (error) {
        console.error("[Settings API] GET Error:", error);
        return apiError("Failed to fetch settings");
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();

        const batch = adminDb.batch();
        let count = 0;

        for (const [key, value] of Object.entries(body)) {
            const docRef = adminDb.collection("GlobalSettings").doc(key);
            batch.set(docRef, { key, value }, { merge: true });
            count++;
        }

        await batch.commit();

        return NextResponse.json({ success: true, updated: count });
    } catch (error) {
        console.error("[Settings API] PUT Error:", error);
        return apiError("Failed to update settings");
    }
}
