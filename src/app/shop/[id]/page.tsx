import { Suspense } from "react";
import { getProductById } from "@/lib/data";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) return {};

    return {
        title: `${product.name} | Advika Vastu-Structural`,
        description: product.description || `Buy ${product.name} from Advika Vastu-Structural`,
        openGraph: {
            title: `${product.name} | Advika Vastu-Structural`,
            description: product.description || `Buy ${product.name} from Advika Vastu-Structural`,
            images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : undefined,
        },
    };
}

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
