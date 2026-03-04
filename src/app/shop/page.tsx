import { Suspense } from "react";
import { getProducts } from "@/lib/data";
import ShopContent from "./ShopContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shop | Advika Vastu-Structural",
    description: "Browse our shop for high-quality architectural and vastu-related products.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
    const products = await getProducts();
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-gold-accent/30 border-t-gold-accent rounded-full animate-spin" /></div>}>
            <ShopContent products={products} />
        </Suspense>
    );
}
