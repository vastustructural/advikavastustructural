import { adminDb } from "@/lib/firebase-admin";
import { Metadata } from "next";
import ToolsContent from "./ToolsContent";

export const metadata: Metadata = {
    title: "Construction Tools & Calculators | Advika Vastu-Structural",
    description: "Free professional calculators for construction cost estimation, interior design budgeting, plot area, FSI/FAR calculation, and home loan EMI planning.",
    keywords: ["construction cost calculator", "home loan emi calculator", "plot area calculator", "FSI FAR calculator", "interior design cost"],
};

export const revalidate = 60;

async function getCalculators() {
    try {
        const snapshot = await adminDb
            .collection("Calculator")
            .orderBy("order", "asc")
            .get();

        return snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((c: any) => c.isVisible !== false);
    } catch (error) {
        console.error("Error fetching calculators:", error);
        return [];
    }
}

export default async function ToolsPage() {
    const calculators = await getCalculators();
    return <ToolsContent calculators={calculators as any} />;
}
