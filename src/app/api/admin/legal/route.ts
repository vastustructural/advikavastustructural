import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const snapshot = await adminDb.collection("LegalPage").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Legal API] GET Error:", error);
        return apiError("Failed to fetch legal pages");
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();

        const snapshot = await adminDb.collection("LegalPage").where("slug", "==", body.slug).limit(1).get();
        if (snapshot.empty) return apiError("Legal page not found");

        const docId = snapshot.docs[0].id;
        await adminDb.collection("LegalPage").doc(docId).update({
            title: body.title,
            content: body.content,
        });

        const updatedDoc = await adminDb.collection("LegalPage").doc(docId).get();
        return NextResponse.json(updatedDoc.data());
    } catch (error) {
        console.error("[Legal API] PUT Error:", error);
        return apiError("Failed to update legal page");
    }
}
