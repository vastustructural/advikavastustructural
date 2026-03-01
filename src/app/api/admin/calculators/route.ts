import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, validateFields, sanitizeObject, apiError } from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;

        const snapshot = await adminDb.collection("Calculator").orderBy("order", "asc").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Calculators API] GET Error:", error);
        return apiError("Failed to fetch calculators");
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, errorResponse } = await requireAuth();
        if (!authorized) return errorResponse;
        const body = await req.json();
        const { valid, errorResponse: ve } = validateFields(body, ["name", "formula"]);
        if (!valid) return ve;
        const sanitized = sanitizeObject(body, ["name", "description", "resultLabel", "resultUnit"]);

        const newId = nanoid();
        const calculatorData = {
            id: newId,
            name: sanitized.name,
            slug: sanitized.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
            description: sanitized.description || "",
            fields: body.fields || [],
            formula: body.formula,
            resultLabel: sanitized.resultLabel || "Estimated Result",
            resultUnit: sanitized.resultUnit || "₹",
            order: body.order ?? 0,
            isVisible: body.isVisible ?? true,
        };

        await adminDb.collection("Calculator").doc(newId).set(calculatorData);

        return NextResponse.json(calculatorData, { status: 201 });
    } catch (error) {
        console.error("[Calculators API] POST Error:", error);
        return apiError("Failed to create calculator");
    }
}
