"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    CheckCircle2, ChevronRight, ShoppingBag, Loader2, MessageCircle,
    ChevronDown, Sparkles, Download, Package, ImageIcon,
} from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/* ─── Animation Variants ─────────────────────────────────── */
const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45 },
};
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

/* ─── Types ──────────────────────────────────────────────── */
interface Service {
    id: string;
    title: string;
    slug: string;
    description: string;
    icon: string | null;
    price?: string | null;
    originalPrice?: string | null;
    sampleImageUrl?: string | null;
    sampleDocumentUrl?: string | null;
    inclusions?: string[] | null;
    processSteps: string[] | null;
    deliverables: string[] | null;
    order: number;
}

/* ─── Helpers ────────────────────────────────────────────── */
function formatPrice(price: string | null | undefined): string | null {
    if (!price) return null;
    if (price.includes("₹")) return price;
    const num = Number(price);
    if (isNaN(num)) return price;
    return `₹${num.toLocaleString("en-IN")}`;
}

function calculateDiscount(original: string | null | undefined, current: string | null | undefined): number | null {
    if (!original || !current) return null;
    const origNum = Number(original.replace(/\D/g, ""));
    const currNum = Number(current.replace(/\D/g, ""));
    if (isNaN(origNum) || isNaN(currNum) || origNum <= currNum || origNum === 0) return null;
    return Math.round(((origNum - currNum) / origNum) * 100);
}

/* ─── Service Card ───────────────────────────────────────── */
function ServiceCard({
    service,
    onPurchase,
    loading,
}: {
    service: Service;
    onPurchase: (s: Service) => void;
    loading: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const inclusions = Array.isArray(service.inclusions) ? service.inclusions : [];
    const deliverables = Array.isArray(service.deliverables) ? service.deliverables : [];
    const processSteps = Array.isArray(service.processSteps) ? service.processSteps : [];

    const hasDetails = deliverables.length > 0 || processSteps.length > 0;

    // Use database values strictly - no hardcoded fallbacks
    const displayPrice = service.price || null;
    const displayOriginalPrice = (service as any).originalPrice || null;
    const displaySampleImageUrl = service.sampleImageUrl || null;
    const displaySampleDocumentUrl = service.sampleDocumentUrl || null;

    const price = formatPrice(displayPrice);
    const originalPrice = formatPrice(displayOriginalPrice);
    const discount = calculateDiscount(displayOriginalPrice, displayPrice);

    return (
        <Card className="group border border-navy-primary/10 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white overflow-hidden rounded-[2.5rem] flex flex-col h-full ring-1 ring-navy-primary/5">
            {/* Sample Image Header */}
            <div className="relative h-56 sm:h-64 overflow-hidden bg-navy-primary/5 shrink-0">
                {displaySampleImageUrl ? (
                    <img
                        src={displaySampleImageUrl}
                        alt={`${service.title} sample`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-navy-primary/10 gap-3 bg-cream-bg">
                        <ImageIcon className="w-16 h-16 opacity-20" />
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Sample Under Preparation</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    <Badge className="bg-white/95 backdrop-blur-md text-navy-primary border-0 font-black px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg shadow-xl">
                        {service.icon || "📋"} Professional Service
                    </Badge>
                </div>

                {/* Offer Badge */}
                {discount && (
                    <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-red-500 text-white border-0 font-black px-3 py-1.5 text-xs shadow-2xl animate-bounce-subtle rounded-lg uppercase tracking-tighter">
                            BEST OFFER - SAVE {discount}%
                        </Badge>
                    </div>
                )}

                {/* Download Button - Redesigned for Mobile Responsiveness (Android/Desktop) */}
                <a
                    href={displaySampleDocumentUrl || "#"}
                    download={displaySampleDocumentUrl ? `${service.slug}-sample` : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/30 font-bold px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl transition-all z-10 group/dl ${!displaySampleDocumentUrl ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/dl:animate-bounce shrink-0" />
                    <span className="text-[10px] sm:text-xs tracking-wide uppercase font-black truncate">Verify Quality: Download Sample</span>
                </a>
            </div>

            <CardContent className="p-6 md:p-10 flex flex-col flex-1 bg-gradient-to-b from-white to-cream-bg/20">
                {/* Header Section */}
                <div className="mb-8">
                    <h3 className="text-3xl font-black text-navy-dark leading-tight group-hover:text-sky-primary transition-colors tracking-tight">
                        {service.title}
                    </h3>
                    <p className="text-muted-foreground text-base mt-3 leading-relaxed font-medium">
                        {service.description}
                    </p>
                </div>

                {/* Core Inclusions GRID - Always Visible */}
                <div className="mb-10 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-px bg-navy-primary/10 flex-1"></div>
                        <span className="text-[10px] uppercase font-black text-navy-primary/40 tracking-[0.2em]">What You Get</span>
                        <div className="h-px bg-navy-primary/10 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {inclusions.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-navy-primary/5 shadow-sm group/item hover:border-gold-accent/30 transition-colors">
                                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                </div>
                                <span className="text-xs font-bold text-navy-dark/90 leading-snug">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Process & Deliverables Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {/* Process */}
                    {processSteps.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-[10px] uppercase font-black text-gold-accent tracking-widest pl-1">Execution Process</p>
                            <div className="space-y-3">
                                {processSteps.map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-lg bg-gold-accent/10 text-gold-accent text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-black">
                                            {i + 1}
                                        </span>
                                        <p className="text-xs text-navy-dark/70 font-bold leading-relaxed">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Deliverables */}
                    {deliverables.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-[10px] uppercase font-black text-sky-primary tracking-widest pl-1">Final Deliverables</p>
                            <div className="space-y-3">
                                {deliverables.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Package className="w-4 h-4 text-sky-primary/40 shrink-0 mt-0.5" />
                                        <p className="text-xs text-navy-dark/70 font-bold leading-relaxed">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Section - Pinned Bottom */}
                <div className="mt-auto pt-8 border-t border-navy-primary/10">
                    {price ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-end justify-between px-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black text-navy-primary/30 tracking-widest">Total Investment</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-black text-navy-dark tracking-tighter">{price}</span>
                                        {originalPrice && (
                                            <span className="text-base font-bold text-navy-primary/20 line-through decoration-red-500/30">
                                                {originalPrice}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <Badge variant="outline" className="border-green-100 bg-green-50 text-green-600 font-bold px-3 py-1 text-[10px] rounded-full uppercase tracking-widest">
                                        All Inclusive
                                    </Badge>
                                </div>
                            </div>

                            <Button
                                onClick={() => onPurchase(service)}
                                disabled={loading}
                                className="w-full h-16 rounded-[1.5rem] sky-gradient text-white font-black text-lg shadow-2xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-6 h-6" />}
                                <span>Get It Now</span>
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => onPurchase(service)}
                            disabled={loading}
                            className="w-full h-16 rounded-[1.5rem] bg-navy-primary text-white font-black text-lg shadow-xl shadow-navy-primary/20 hover:bg-navy-dark transition-all flex items-center justify-center gap-3"
                        >
                            <MessageCircle className="w-6 h-6" />
                            <span>Request Professional Quote</span>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/* ─── Main Page Component ────────────────────────────────── */
export default function ServicesContent({ services }: { services: Service[] }) {
    const { checkout, loading } = useRazorpay();
    const router = useRouter();

    const [checkoutService, setCheckoutService] = useState<Service | null>(null);
    const [buyerName, setBuyerName] = useState("");
    const [buyerEmail, setBuyerEmail] = useState("");
    const [buyerPhone, setBuyerPhone] = useState("");
    const [buyerRequirements, setBuyerRequirements] = useState("");
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);

    const handlePurchase = (service: Service) => {
        // Only proceed if price exists
        if (!service.price) {
            toast.error("Contact us for a custom quote on this service.");
            return;
        }

        setCheckoutService({ ...service });
        setBuyerName("");
        setBuyerEmail("");
        setBuyerPhone("");
        setBuyerRequirements("");
        setCheckoutOpen(true);
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkoutService?.price) return;

        setCheckoutOpen(false);
        await checkout({
            amount: checkoutService.price,
            name: buyerName,
            email: buyerEmail,
            phone: buyerPhone,
            requirements: buyerRequirements,
            description: `Service: ${checkoutService.title}`,
            onSuccess: (response: any) => {
                setPurchaseSuccess(true);
                router.push(`/thank-you?order_id=${response.razorpay_order_id || "ADV-VSR"}`);
            },
        });
        setCheckoutService(null);
    };

    return (
        <>
            {/* ── Hero ─────────────────────────────────────── */}
            <section className="brand-gradient text-white pt-24 pb-16 md:pt-36 md:pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white blur-[100px] mix-blend-overlay" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gold-accent blur-[100px] mix-blend-overlay" />
                </div>
                <div className="container-wide relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <Badge variant="outline" className="text-white/90 border-white/20 mb-6 px-5 py-2 backdrop-blur-md shadow-lg rounded-full text-xs font-bold uppercase tracking-widest">
                            <Sparkles className="w-4 h-4 mr-2" /> Professional Tier Services
                        </Badge>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 tracking-tight leading-tight">
                            Elevate Your Project with <br className="hidden md:block" />
                            <span className="text-gold-accent drop-shadow-lg">Expert Services</span>
                        </h1>
                        <p className="text-white/70 text-lg md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
                            Premium architectural, structural, and Vastu planning solutions tailored for excellence. Purchase securely and receive high-quality deliverables directly.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Service Cards Grid ───────────────────────── */}
            <section className="section-padding bg-cream-bg/40 relative">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                <div className="container-wide relative z-10">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={stagger}
                        className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10"
                    >
                        {services.map((service) => (
                            <motion.div key={service.id} variants={fadeInUp} className="h-full">
                                <ServiceCard service={service} onPurchase={handlePurchase} loading={loading} />
                            </motion.div>
                        ))}
                    </motion.div>

                    {services.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-navy-primary/5 mt-8">
                            <Package className="w-16 h-16 text-navy-primary/20 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-navy-dark">No Services Available</h3>
                            <p className="text-muted-foreground mt-2">Check back soon for our professional offerings.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────── */}
            <section className="py-24 brand-gradient text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold-accent blur-[150px] mix-blend-overlay" />
                </div>
                <div className="container-wide relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Need a Custom Solution?</h2>
                    <p className="text-white/70 text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                        We offer entirely bespoke architectural and engineering solutions for unique, large-scale project requirements.
                    </p>
                    <Button asChild size="lg" className="bg-white text-navy-primary hover:bg-white/90 hover:scale-105 font-black shadow-2xl px-10 h-16 rounded-2xl text-lg transition-all">
                        <Link href="/contact">Get in Touch <ChevronRight className="w-5 h-5 ml-2" /></Link>
                    </Button>
                </div>
            </section>

            {/* ── Checkout Dialog ──────────────────────────── */}
            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogContent className="max-w-md w-[95vw] sm:w-full rounded-[2.5rem] p-0 overflow-hidden bg-white shadow-3xl border-0">
                    <div className="p-6 sm:p-8 md:p-10 max-h-[85vh] overflow-y-auto">
                        <DialogHeader className="mb-8">
                            <DialogTitle className="text-3xl font-black text-navy-dark tracking-tight">Complete Purchase</DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground mt-2 leading-relaxed">
                                Enter your details below. Once payment is successful, our team will initiate your service delivery.
                            </DialogDescription>
                        </DialogHeader>

                        {checkoutService && (
                            <div className="bg-navy-primary/[0.03] rounded-3xl p-5 mb-8 flex items-center gap-5 border border-navy-primary/10 shadow-inner">
                                <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center text-2xl shrink-0 shadow-md">
                                    {checkoutService.icon || "📋"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-navy-dark text-lg truncate mb-0.5">{checkoutService.title}</p>
                                    <p className="text-sm font-bold text-gold-accent uppercase tracking-widest">
                                        Total: {formatPrice(checkoutService.price)}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="svc-name" className="text-xs uppercase font-black text-navy-primary/50 tracking-widest pl-1">Full Name *</Label>
                                <Input id="svc-name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Enter your full name" required className="h-14 rounded-2xl border-navy-primary/10 bg-cream-bg/30 px-4 text-base shadow-sm focus-visible:ring-gold-accent" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="svc-email" className="text-xs uppercase font-black text-navy-primary/50 tracking-widest pl-1">Email Address *</Label>
                                <Input id="svc-email" type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="your@email.com" required className="h-14 rounded-2xl border-navy-primary/10 bg-cream-bg/30 px-4 text-base shadow-sm focus-visible:ring-gold-accent" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="svc-phone" className="text-xs uppercase font-black text-navy-primary/50 tracking-widest pl-1">WhatsApp Number *</Label>
                                <Input id="svc-phone" type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required className="h-14 rounded-2xl border-navy-primary/10 bg-cream-bg/30 px-4 text-base shadow-sm focus-visible:ring-gold-accent" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="svc-req" className="text-xs uppercase font-black text-navy-primary/50 tracking-widest pl-1">Project Requirements (Optional)</Label>
                                <Textarea id="svc-req" value={buyerRequirements} onChange={(e) => setBuyerRequirements(e.target.value)} placeholder="Tell us about your plot size, preferences, or special needs..." className="min-h-[100px] rounded-2xl border-navy-primary/10 bg-cream-bg/30 px-4 py-3 text-base shadow-sm focus-visible:ring-gold-accent resize-none" />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl gold-gradient text-navy-primary font-black text-lg shadow-xl shadow-gold-accent/20 hover:shadow-2xl hover:-translate-y-1 transition-all mt-4">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <ShoppingBag className="w-6 h-6 mr-2" />}
                                Pay Securely {checkoutService ? `• ${formatPrice(checkoutService.price)}` : ""}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Success Dialog ───────────────────────────── */}
            <Dialog open={purchaseSuccess} onOpenChange={setPurchaseSuccess}>
                <DialogContent className="max-w-sm rounded-[2.5rem] text-center p-10 border-0 shadow-3xl">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6 border-4 border-green-100 shadow-inner">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-navy-dark mb-3 tracking-tight">Payment Successful!</DialogTitle>
                        <DialogDescription className="text-muted-foreground mb-6">
                            Thank you! Our team will deliver your service via WhatsApp shortly.
                        </DialogDescription>
                        <Button asChild className="w-full brand-gradient text-white font-bold rounded-2xl h-12 shadow-lg">
                            <a href="https://wa.me/919067969756" target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="w-4 h-4 mr-2" /> Message us on WhatsApp
                            </a>
                        </Button>
                        <Button variant="ghost" className="mt-3 w-full text-navy-primary/60" onClick={() => setPurchaseSuccess(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
