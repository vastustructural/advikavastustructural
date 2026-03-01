"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useRazorpay } from "@/hooks/useRazorpay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft, ShoppingBag, Eye, Maximize,
    Compass, Layers, Home, Ruler, Car, Search, Tag, Info, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Product {
    id: string;
    name: string;
    slug: string;
    code: string | null;
    description: string | null;
    price: string | null;
    originalPrice: string | null;
    imageUrl: string | null;
    category: string | null;
    area: string | null;
    floors: number | null;
    direction: string | null;
    width: number | null;
    depth: number | null;
    bhk: string | null;
    vastu: string | null;
    [key: string]: any;
}

export default function ProductDetailClient({ product }: { product: Product }) {
    const { checkout, loading } = useRazorpay();

    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [buyerName, setBuyerName] = useState("");
    const [buyerPhone, setBuyerPhone] = useState("");

    const displayPrice = (priceStr: string | null) => {
        if (!priceStr || priceStr === "Contact" || priceStr === "Contact for price") return "Contact for price";
        if (priceStr.includes("₹")) return priceStr;
        return `₹${Number(priceStr).toLocaleString("en-IN")}`;
    };

    const handlePurchase = () => {
        if (!product.price || product.price === "Contact" || product.price === "Contact for price") {
            toast.info("Please contact us for purchasing this design.");
            return;
        }
        setCheckoutOpen(true);
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!buyerName || !buyerPhone) {
            toast.error("Please fill in all details");
            return;
        }

        if (buyerPhone.length < 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        toast.info("Initializing payment gateway...");
        setCheckoutOpen(false); // Close dialog while processing

        try {
            const numericPrice = parseFloat(product.price!.replace(/[^0-9.]/g, ""));
            // Trigger Razorpay with professional user details tracked to DB
            await checkout({
                amount: numericPrice,
                name: buyerName,
                phone: buyerPhone,
                productId: product.id,
                description: `Payment for ${product.code || product.name}`
            });
            // Result is handled by useRazorpay (redirects to /thank-you)
        } catch (error) {
            console.error("Checkout initialization failed:", error);
            toast.error("Failed to start checkout process. Please try again.");
            setCheckoutOpen(true); // Re-open on crash
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 pt-12 md:pt-20">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Top Nav */}
                <Link href="/shop" className="inline-flex items-center text-slate-500 hover:text-navy-primary font-medium tracking-wide transition-colors mb-8 group">
                    <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                    Back to Design Gallery
                </Link>

                <div className="bg-white rounded-[2rem] shadow-xl shadow-navy-primary/5 overflow-hidden border border-slate-100 flex flex-col lg:flex-row">

                    {/* Left side: Large Image */}
                    <div className="lg:w-7/12 relative min-h-[400px] lg:min-h-[700px] bg-slate-100 flex items-center justify-center p-8 group">
                        {product.imageUrl ? (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-contain drop-shadow-2xl transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
                                sizes="(max-width: 1024px) 100vw, 60vw"
                            />
                        ) : (
                            <span className="text-9xl opacity-10">🏠</span>
                        )}
                        <div className="absolute inset-0 border-[10px] border-white/20 pointer-events-none mix-blend-overlay" />
                        <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/90 font-medium text-sm flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span>{product.name}</span>
                            <Maximize className="w-5 h-5 text-white/70" />
                        </div>
                    </div>

                    {/* Right side: Product Data */}
                    <div className="lg:w-5/12 p-8 lg:p-12 flex flex-col bg-white">
                        {/* Header Details */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                {product.category && (
                                    <Badge className="mb-4 bg-navy-primary/5 text-navy-primary hover:bg-navy-primary/10 border-0 text-xs font-black uppercase tracking-widest px-3 py-1">
                                        {product.category}
                                    </Badge>
                                )}
                                <h1 className="text-3xl lg:text-4xl font-black text-navy-dark leading-tight tracking-tight mb-3">
                                    {product.name}
                                </h1>
                            </div>
                        </div>

                        {/* Top Features Box (Like reference image red/white dividers) */}
                        <div className="grid grid-cols-2 gap-px bg-slate-100 border border-slate-100 mb-8 rounded-xl overflow-hidden">
                            <div className="bg-white p-5 flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 mb-2 text-red-600">
                                    <Maximize className="w-5 h-5" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">Plot Area</span>
                                </div>
                                <span className="font-bold text-slate-800 text-sm">{product.area || "N/A"}</span>
                            </div>
                            <div className="bg-white p-5 flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 mb-2 text-red-600">
                                    <Ruler className="w-5 h-5" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">Plot Dimensions</span>
                                </div>
                                <span className="font-bold text-slate-800 text-sm">
                                    {product.width && product.depth ? `${product.width}' × ${product.depth}'` : "Custom Sizes"}
                                </span>
                            </div>
                            <div className="bg-white p-5 flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 mb-2 text-red-600">
                                    <Layers className="w-5 h-5" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">Floor</span>
                                </div>
                                <span className="font-bold text-slate-800 text-sm">{product.floors ? `${product.floors} Storey` : "N/A"}</span>
                            </div>
                            <div className="bg-white p-5 flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 mb-2 text-red-600">
                                    <Compass className="w-5 h-5" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">Style</span>
                                </div>
                                <span className="font-bold text-slate-800 text-sm">{product.category || "Hospitality Design"}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-10 pb-10 border-b border-slate-100">
                            {product.code && (
                                <div className="bg-slate-100 text-slate-600 font-mono font-bold py-4 px-6 rounded-xl flex items-center justify-center min-w-[120px] text-lg">
                                    {product.code}
                                </div>
                            )}
                            <Button
                                onClick={handlePurchase}
                                disabled={loading || !product.price || product.price === "Contact" || product.price === "Contact for price"}
                                className={`flex-1 h-16 rounded-xl text-lg font-bold shadow-lg shadow-red-600/20 hover:-translate-y-1 transition-all ${!product.price || product.price === "Contact" || product.price === "Contact for price" ? 'bg-slate-300 text-slate-500 shadow-none hover:translate-y-0 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : (!product.price || product.price === "Contact" || product.price === "Contact for price" ? "Contact to Enquire" : "Buy Design Package Now")}
                            </Button>
                        </div>

                        {/* Plan Details Grid */}
                        <div>
                            <h3 className="text-xl font-bold text-navy-dark mb-6 flex items-center gap-2">
                                <Info className="w-5 h-5 text-gold-accent" /> Plan Details
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-slate-500 font-medium mb-1 relative z-10">Unit Type</span>
                                    <span className="text-lg font-bold text-navy-dark">{product.bhk || "2BHK"}</span>
                                </div>
                                <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-slate-500 font-medium mb-1">Floors</span>
                                    <span className="text-lg font-bold text-navy-dark">{product.floors || "1"}</span>
                                </div>
                                <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-slate-500 font-medium mb-1">Facing</span>
                                    <span className="text-lg font-bold text-navy-dark">{product.direction || "Any Primary"}</span>
                                </div>
                                <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-slate-500 font-medium mb-1">Vastu Compliant</span>
                                    <span className="text-lg font-bold text-navy-dark">{product.vastu === "Yes" ? "100%" : "Optional"}</span>
                                </div>
                                <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-slate-500 font-medium mb-1">Total Build Area</span>
                                    <span className="text-lg font-bold text-navy-dark uppercase text-sm">{product.area || "Standard"}</span>
                                </div>
                                <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-slate-500 font-medium mb-1">Delivery</span>
                                    <span className="text-lg font-bold text-navy-dark text-sm">Instant PDF</span>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        {product.description && (
                            <div className="mt-10 pt-10 border-t border-slate-100">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Description</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Checkout Options Overlay */}
            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden bg-white shadow-2xl border-0">
                    <div className="p-8">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-black text-navy-dark">Secure Digital Delivery</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Please provide your precise details to access and download the {product.name} package after checkout.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="bg-cream-bg/50 rounded-2xl p-4 mb-6 flex items-center gap-4">
                            <span className="text-4xl">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover" /> : "📐"}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-navy-dark truncate">{product.name}</p>
                                <p className="text-xs text-navy-primary/50">{product.code || product.id.substring(0, 8)}</p>
                            </div>
                            <span className="text-xl font-black text-navy-primary">{displayPrice(product.price)}</span>
                        </div>

                        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="buyer-name" className="text-sm font-bold text-navy-dark">Full Legal Name *</Label>
                                <Input
                                    id="buyer-name"
                                    value={buyerName}
                                    onChange={(e) => setBuyerName(e.target.value)}
                                    placeholder="Used for Invoice generation"
                                    required
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="buyer-phone" className="text-sm font-bold text-navy-dark">WhatsApp Number *</Label>
                                <Input
                                    id="buyer-phone"
                                    type="tel"
                                    value={buyerPhone}
                                    onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, ''))}
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                    minLength={10}
                                    required
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white tracking-wide"
                                />
                            </div>
                            <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)} className="rounded-xl h-12 px-6 font-bold">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-navy-dark hover:bg-navy-primary text-white rounded-xl h-12 px-8 font-bold shadow-lg">
                                    {loading ? "Processing..." : "Proceed to Payment"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
