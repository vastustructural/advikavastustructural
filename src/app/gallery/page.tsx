import { getGalleryItems, getGalleryCategories } from "@/lib/data";
import GalleryContent from "./GalleryContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gallery | Advika Vastu-Structural",
    description: "Browse our portfolio of completed architectural and structural projects across India.",
};

export default async function GalleryPage() {
    const [items, categories] = await Promise.all([
        getGalleryItems(),
        getGalleryCategories(),
    ]);
    return <GalleryContent items={items} categories={categories} />;
}
