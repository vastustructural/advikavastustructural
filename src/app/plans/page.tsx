import { getPlans } from "@/lib/data";
import PlansContent from "./PlansContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing & Plans | Advika Vastu-Structural",
    description: "View our comprehensive plans for architectural, structural, and vastu services.",
};

export default async function PlansPage() {
    const plans = await getPlans();
    return <PlansContent plans={plans} />;
}
