"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Star, ChevronRight, Clock, MessageCircle, Loader2, ShoppingBag } from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
};

const stagger = {
    animate: { transition: { staggerChildren: 0.15 } },
};

interface Plan {
    id: string; name: string; slug: string; description: string | null; price: string;
    features: any; timeline: string | null; isFeatured: boolean; order: number;
}

export default function PlansContent({ plans }: { plans: Plan[] }) {
    const { checkout, loading } = useRazorpay();
    const router = useRouter();

    // Checkout dialog state
    const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
    const [buyerName, setBuyerName] = useState("");
    const [buyerEmail, setBuyerEmail] = useState("");
    const [buyerPhone, setBuyerPhone] = useState("");
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    const handlePlanSelect = (plan: Plan) => {
        if (plan.price === "Contact Us") {
            window.location.href = "/contact";
            return;
        }
        setCheckoutPlan(plan);
        setBuyerName("");
        setBuyerEmail("");
        setBuyerPhone("");
        setCheckoutOpen(true);
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkoutPlan) return;
        setCheckoutOpen(false);
        await checkout({
            amount: checkoutPlan.price,
            planId: checkoutPlan.id,
            name: buyerName,
            email: buyerEmail,
            phone: buyerPhone,
            description: `Plan: ${checkoutPlan.name}`,
            onSuccess: (response: any) => {
                toast.success("Payment Received Successfully!");
                router.push(`/thank-you?order_id=${response.razorpay_order_id || "ADV-PLN"}`);
            },
        });
        setCheckoutPlan(null);
    };

    return (
        <>
            {/* Hero Banner */}
            <section className="brand-gradient text-white section-padding !pb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-accent blur-[120px]" />
                </div>
                <div className="container-wide relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-gold-accent text-sm font-medium mb-6">
                            <Star className="w-4 h-4 fill-gold-accent text-gold-accent" /> Premium Architectural Packages
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Professional Plans</h1>
                        <p className="text-white/70 text-lg">Choose the perfect architectural planning package for your project. All plans include professional drawings, Vastu compliance checks, and dedicated support.</p>
                    </motion.div>
                </div>
            </section>

            {/* Plans Grid */}
            <section className="section-padding bg-section-gray">
                <div className="container-wide">
                    <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan) => {
                            const features = (plan.features as string[]) || [];
                            return (
                                <motion.div key={plan.id} variants={fadeInUp}>
                                    <Card className={`border-0 hover:shadow-2xl transition-all duration-500 relative h-full rounded-[2rem] overflow-hidden ${plan.isFeatured ? "ring-2 ring-gold-accent shadow-xl scale-[1.02] bg-white" : "shadow-md bg-white border border-border/40"}`}>
                                        {plan.isFeatured && (
                                            <div className="absolute top-0 inset-x-0">
                                                <div className="gold-gradient text-navy-primary text-xs font-bold text-center py-1.5 shadow-sm">
                                                    FEATURED / MOST POPULAR
                                                </div>
                                            </div>
                                        )}
                                        <CardContent className={`p-8 flex flex-col h-full ${plan.isFeatured ? "pt-10" : ""}`}>
                                            <h3 className="text-2xl font-bold text-dark-blue">{plan.name}</h3>
                                            <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{plan.description}</p>
                                            <div className="my-6">
                                                <span className="text-4xl font-black text-navy-primary">
                                                    {plan.price === "Contact Us" ? "Custom" : `₹${plan.price}`}
                                                </span>
                                            </div>
                                            {plan.timeline && (
                                                <div className="flex items-center gap-2 text-sm text-navy-primary/70 font-medium mb-6 bg-navy-primary/5 px-3 py-2 rounded-lg w-fit">
                                                    <Clock className="w-4 h-4" /> Est. {plan.timeline}
                                                </div>
                                            )}
                                            <ul className="space-y-3 mb-8 flex-1">
                                                {features.map((feature: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm">
                                                        <CheckCircle2 className="w-4 h-4 text-gold-accent shrink-0 mt-0.5" />
                                                        <span className="text-muted-foreground font-medium">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                onClick={() => handlePlanSelect(plan)}
                                                disabled={loading}
                                                className={`w-full font-bold h-12 rounded-xl shadow-md ${plan.isFeatured ? "gold-gradient text-navy-primary hover:opacity-90" : "bg-navy-primary text-white hover:bg-navy-dark"}`}
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                {plan.price === "Contact Us" ? "Request Quote" : "Choose Plan"}
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section-padding bg-white relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-accent/5 rounded-full blur-[80px]" />
                <div className="container-wide max-w-3xl text-center relative z-10">
                    <h2 className="text-3xl font-bold text-dark-blue mb-6">Need a Custom Package?</h2>
                    <p className="text-muted-foreground mb-8 text-lg">Our senior architects are here to help you tailor a plan specifically for your plot dimensions, structural requirements, and Vastu criteria.</p>
                    <Button asChild size="lg" className="gold-gradient text-navy-primary font-bold shadow-xl shadow-gold-accent/20 px-10 h-14 rounded-full">
                        <Link href="/contact"><MessageCircle className="w-5 h-5 mr-2" /> Book a Free Consultation</Link>
                    </Button>
                </div>
            </section>

            {/* Checkout Details Dialog */}
            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden bg-white shadow-2xl border-0">
                    <div className="p-8">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-black text-dark-blue">Complete Your Purchase</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Please provide your details to proceed with the payment securely.
                            </DialogDescription>
                        </DialogHeader>

                        {checkoutPlan && (
                            <div className="brand-gradient rounded-2xl p-5 mb-6 text-white shadow-inner relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                                <p className="font-bold text-lg text-white mb-1 relative z-10">{checkoutPlan.name}</p>
                                <p className="text-sm text-white/70 relative z-10 line-clamp-2">{checkoutPlan.description}</p>
                                <p className="text-3xl font-black text-gold-accent mt-3 relative z-10">₹{checkoutPlan.price}</p>
                            </div>
                        )}

                        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="plan-buyer-name" className="text-sm font-bold text-dark-blue">Full Name *</Label>
                                <Input
                                    id="plan-buyer-name"
                                    value={buyerName}
                                    onChange={(e) => setBuyerName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    className="h-12 rounded-xl border-border/50 focus:border-gold-accent focus:ring-1 focus:ring-gold-accent"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="plan-buyer-email" className="text-sm font-bold text-dark-blue">Email Address *</Label>
                                <Input
                                    id="plan-buyer-email"
                                    type="email"
                                    value={buyerEmail}
                                    onChange={(e) => setBuyerEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="h-12 rounded-xl border-border/50 focus:border-gold-accent focus:ring-1 focus:ring-gold-accent"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="plan-buyer-phone" className="text-sm font-bold text-dark-blue">Phone Number *</Label>
                                <Input
                                    id="plan-buyer-phone"
                                    type="tel"
                                    value={buyerPhone}
                                    onChange={(e) => setBuyerPhone(e.target.value)}
                                    placeholder="+91 XXXXX XXXXX"
                                    required
                                    className="h-12 rounded-xl border-border/50 focus:border-gold-accent focus:ring-1 focus:ring-gold-accent"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl gold-gradient text-navy-primary font-bold text-base shadow-xl shadow-gold-accent/20 mt-6"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShoppingBag className="w-5 h-5 mr-2" />}
                                Proceed to Pay {checkoutPlan ? `₹${checkoutPlan.price}` : ""}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
