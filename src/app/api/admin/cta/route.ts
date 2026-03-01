import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const snapshot = await adminDb.collection("CTASection").orderBy("order", "asc").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error("[CTA API] GET Error:", error);
        return apiError("Failed to fetch CTA sections");
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();

        let targetId = body.id;

        if (!targetId) {
            // Find first CTA section if no ID provided
            const snapshot = await adminDb.collection("CTASection").limit(1).get();
            if (!snapshot.empty) {
                targetId = snapshot.docs[0].id;
            } else {
                targetId = nanoid();
            }
        }

        const sectionData = {
            id: targetId,
            headline: body.headline || "Get Your Dream Project Started",
            subtext: body.subtext || "",
            buttonText: body.buttonText || "Get Started",
            buttonUrl: body.buttonUrl || "/contact",
            isVisible: body.isVisible ?? true,
        };

        await adminDb.collection("CTASection").doc(targetId).set(sectionData, { merge: true });

        const doc = await adminDb.collection("CTASection").doc(targetId).get();
        return NextResponse.json(doc.data());
    } catch (error) {
        console.error("[CTA API] PUT Error:", error);
        return apiError("Failed to update CTA section");
    }
}
