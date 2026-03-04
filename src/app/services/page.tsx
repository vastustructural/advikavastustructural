import { getServices } from "@/lib/data";
import ServicesContent from "./ServicesContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Services | Advika Vastu-Structural",
    description: "Explore our architecture, structural planning, and vastu consultation services.",
};

export default async function ServicesPage() {
    const services = await getServices();
    return <ServicesContent services={services as any} />;
}
