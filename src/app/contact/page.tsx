import { adminDb } from "@/lib/firebase-admin";
import ContactContent from "./ContactContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | Advika Vastu-Structural",
    description: "Get in touch with our team of experts for structural, architectural, and vastu consultation services.",
};

export const revalidate = 60; // revalidate every 60 seconds

async function getContactSettings() {
    try {
        const doc = await adminDb.collection("AppSettings").doc("contact_settings").get();
        if (doc.exists) {
            return doc.data();
        }
        return {};
    } catch (error) {
        console.error("Error fetching contact settings:", error);
        return {};
    }
}

export default async function ContactPage() {
    const settings = await getContactSettings();
    return <ContactContent settings={settings as any} />;
}
