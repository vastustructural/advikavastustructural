import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const snapshot = await adminDb.collection("GlobalSettings").get();

        const settings: Record<string, any> = {};
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const key = data.key || doc.id;
            settings[key] = data.value;
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("[Public Settings API] GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}
