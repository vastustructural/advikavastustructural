import { Suspense } from "react";
import { getProductById } from "@/lib/data";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-gold-accent/30 border-t-gold-accent rounded-full animate-spin" /></div>}>
            <ProductDetailClient product={product} />
        </Suspense>
    );
}
