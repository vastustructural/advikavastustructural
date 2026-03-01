import { adminDb } from "@/lib/firebase-admin";
import ContactContent from "./ContactContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | Advika Vastu-Structural",
    description: "Get in touch with our team of experts for structural, architectural, and vastu consultation services.",
};

export const revalidate = 60; // revalidate every 60 seconds

async function getGlobalSettings() {
    try {
        const snapshot = await adminDb.collection("GlobalSettings").get();
        const settings: Record<string, any> = {};
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const key = data.key || doc.id;
            settings[key] = data.value;
        }
        return settings;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return {};
    }
}

export default async function ContactPage() {
    const settings = await getGlobalSettings();
    return <ContactContent settings={settings} />;
}
