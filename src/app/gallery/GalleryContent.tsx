"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

interface GalleryItem {
    id: string; title: string | null; description: string | null; imageUrl: string;
    category: { id: string; name: string }; order: number;
}
interface Category { id: string; name: string; }

export default function GalleryContent({ items, categories }: { items: GalleryItem[]; categories: Category[] }) {
    const [activeCategory, setActiveCategory] = useState("All");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const filtered = activeCategory === "All"
        ? items
        : items.filter((item) => item.category?.name === activeCategory);

    const openLightbox = (index: number) => { setCurrentIndex(index); setLightboxOpen(true); };
    const navigate = (direction: number) => { setCurrentIndex((prev) => (prev + direction + filtered.length) % filtered.length); };

    const categoryNames = ["All", ...categories.map((c) => c.name)];

    return (
        <>
            <section className="sky-gradient text-white section-padding !pb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"><div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" /></div>
                <div className="container-wide relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Gallery</h1>
                        <p className="text-white/70 text-lg">Explore our portfolio of completed projects and design concepts.</p>
                    </motion.div>
                </div>
            </section>

            <section className="section-padding bg-section-gray">
                <div className="container-wide">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-2 mb-10">
                        {categoryNames.map((cat) => (
                            <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)}
                                className={`rounded-full px-5 ${activeCategory === cat ? "sky-gradient text-white border-0" : "border-sky-primary/20 text-muted-foreground hover:text-sky-primary"}`}>
                                {cat}
                            </Button>
                        ))}
                    </motion.div>

                    <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((item, i) => (
                                <motion.div key={item.id} layout variants={fadeInUp} exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br from-sky-primary/5 to-sky-dark/10"
                                    onClick={() => openLightbox(i)}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {item.imageUrl ? <img src={item.imageUrl} alt={item.title || ""} className="w-full h-full object-cover" /> : <span className="text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-500">🖼️</span>}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-blue/80 via-dark-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                        <Badge className="w-fit bg-sky-primary/80 text-white border-0 mb-2 text-xs">{item.category?.name || "General"}</Badge>
                                        <h3 className="text-white font-semibold text-sm md:text-base">{item.title}</h3>
                                        <div className="absolute top-4 right-4"><div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><ZoomIn className="w-5 h-5 text-white" /></div></div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                        <DialogContent className="max-w-3xl p-0 bg-dark-blue border-none overflow-hidden">
                            <DialogTitle className="sr-only">Image Lightbox</DialogTitle>
                            {filtered[currentIndex] && (
                                <div className="relative">
                                    <div className="h-[60vh] flex items-center justify-center bg-gradient-to-br from-sky-primary/10 to-sky-dark/20">
                                        {filtered[currentIndex].imageUrl
                                            ? <img src={filtered[currentIndex].imageUrl} alt={filtered[currentIndex].title || ""} className="max-h-full max-w-full object-contain" />
                                            : <span className="text-9xl">🖼️</span>}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-blue to-transparent p-6">
                                        <Badge className="bg-sky-primary text-white border-0 mb-2">{filtered[currentIndex].category?.name}</Badge>
                                        <h3 className="text-white text-xl font-semibold">{filtered[currentIndex].title}</h3>
                                    </div>
                                    <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                                    <button onClick={() => navigate(1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No gallery items in this category.</p>}
                </div>
            </section>
        </>
    );
}
