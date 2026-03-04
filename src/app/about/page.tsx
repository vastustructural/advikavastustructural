import { getSettings } from "@/lib/data";
import AboutContent from "./AboutContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | Advika Vastu-Structural",
    description: "Learn about Advika Vastu-Structural, our mission, and our team of expert architects and vastu consultants.",
};

export default async function AboutPage() {
    const settings = await getSettings();
    return <AboutContent settings={settings} />;
}
