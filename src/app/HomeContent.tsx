"use client";

import { motion } from "framer-motion";
import {
    ArrowRight, CheckCircle2, Star, Calculator, Megaphone,
    MapPin, Building2, Layout, Ruler, Clock, ArrowUpRight,
    PlayCircle, Users, Trophy, Target, Sparkles, Building,
    Factory, Landmark, ChevronRight, Zap, Phone, Gift
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import Image from "next/image";
import { HomePageData, HomeService, HomePlan, HomeTestimonial } from "@/lib/types/home";

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

interface CalculatorField {
    name: string;
    label: string;
    type: string;
    min?: number;
    max?: number;
    defaultValue: number;
    unit?: string;
    options?: { label: string; value: number }[];
}

interface CalculatorType {
    id: string;
    name: string;
    description?: string;
    fields: CalculatorField[];
    formula: string;
    resultLabel: string;
    resultUnit: string;
}

interface CtaSectionType {
    headline: string;
    subtext?: string;
    buttonText: string;
    buttonUrl: string;
}

import ReferralSection from "@/components/sections/ReferralSection";

interface HomeContentProps {
    services: HomeService[];
    plans: HomePlan[];
    testimonials: HomeTestimonial[];
    settings: any;
    calculators: CalculatorType[];
    ctaSections: CtaSectionType[];
    homeData: HomePageData;
}

function DynamicCalculator({ calculator }: { calculator: CalculatorType }) {
    const fields = (calculator.fields || []) as CalculatorField[];
    const initialValues: Record<string, number> = {};
    fields.forEach((f) => { initialValues[f.name] = f.defaultValue; });

    const [values, setValues] = useState(initialValues);
    const [result, setResult] = useState<number | null>(null);

    const calculate = () => {
        try {
            // Create a safe scoped function from the formula
            const vars = Object.keys(values);
            const vals = Object.values(values);
            const fn = new Function(...vars, `return ${calculator.formula}; `);
            const res = fn(...vals);
            setResult(typeof res === "number" ? Math.round(res) : null);
        } catch {
            setResult(null);
        }
    };

    return (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full overflow-hidden">
            <div className="brand-gradient p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-accent/20 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-gold-accent" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-base">{calculator.name}</h3>
                    {calculator.description && <p className="text-white/60 text-xs">{calculator.description}</p>}
                </div>
            </div>
            <CardContent className="p-5 space-y-4">
                {fields.map((field) => (
                    <div key={field.name}>
                        <label className="block text-sm font-medium text-dark-blue mb-1.5">
                            {field.label} {field.unit && <span className="text-muted-foreground font-normal">({field.unit})</span>}
                        </label>
                        {field.type === "select" && field.options ? (
                            <select
                                value={values[field.name]}
                                onChange={(e) => setValues({ ...values, [field.name]: Number(e.target.value) })}
                                className="w-full px-3 py-2.5 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-accent/50 transition-all"
                            >
                                {field.options.map((opt) => (
                                    <option key={opt.label} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="number"
                                value={values[field.name]}
                                onChange={(e) => setValues({ ...values, [field.name]: Number(e.target.value) })}
                                min={field.min}
                                max={field.max}
                                className="w-full px-3 py-2.5 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-accent/50 transition-all"
                            />
                        )}
                    </div>
                ))}

                <Button onClick={calculate} className="w-full gold-gradient text-navy-primary font-semibold hover:opacity-90 shadow-md">
                    <Sparkles className="w-4 h-4 mr-2" /> Calculate
                </Button>

                {result !== null && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-cream-bg border border-gold-accent/20 text-center">
                        <p className="text-sm text-muted-foreground mb-1">{calculator.resultLabel}</p>
                        <p className="text-2xl font-bold text-navy-primary">
                            {calculator.resultUnit === "₹" ? `₹${result.toLocaleString("en-IN")} ` : `${result}${calculator.resultUnit} `}
                        </p>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}

export default function HomeContent({ services, plans, testimonials, settings, calculators, ctaSections, homeData }: HomeContentProps) {
    const stats = [
        { value: settings.stats_projects || "1000+", label: "Projects Completed" },
        { value: settings.stats_experience || "15+", label: "Years Experience" },
        { value: settings.stats_clients || "500+", label: "Happy Clients" },
        { value: settings.stats_states || "25+", label: "States Covered" },
    ];

    const cta = ctaSections?.[0];

    return (
        <>
            {/* ─── HERO ─── */}
            <section className="relative min-h-[85vh] flex items-center bg-navy-dark text-white overflow-hidden">
                {/* Animated Architectural Background */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <motion.div
                        initial={{ scale: 1.15 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                        className="w-full h-full relative"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80"
                            alt="Luxury modern architectural home design"
                            fill
                            priority
                            className="object-cover"
                            sizes="100vw"
                        />
                    </motion.div>
                    {/* Deep gradient overlays for text readability & brand feel */}
                    <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/80 to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-transparent z-10" />
                    <div className="absolute inset-0 bg-navy-dark/40 mix-blend-multiply z-10" />
                </div>

                {/* Ambient Glows */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute top-20 left-10 w-[500px] h-[500px] rounded-full bg-gold-accent/10 blur-[100px]" />
                    <div className="absolute bottom-20 right-10 w-[600px] h-[600px] rounded-full bg-gold-accent/10 blur-[120px]" />
                </div>

                <div className="container-wide relative z-20 py-20 px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-gold-accent text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" /> Premium Vastu-Compliant Designs
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                            {homeData?.heroTitle || settings.hero_title || "Expert Vastu-Compliant Architectural & Structural Solutions"}
                        </h1>
                        <p className="text-xl text-white/70 mb-8 max-w-2xl">
                            {homeData?.heroDescription || settings.hero_subtitle || "India's trusted consultancy for residential & commercial architecture, structural planning, and Vastu-compliant designs."}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button asChild size="lg" className="gold-gradient text-navy-primary hover:opacity-90 font-semibold shadow-xl px-8">
                                <Link href={homeData?.heroButtonLink || "/services"}>{homeData?.heroButtonText || "Explore Services"} <ArrowRight className="w-4 h-4 ml-2" /></Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="gold-gradient border-gold-accent/30 text-black hover:bg-white-accent/10 font-semibold px-8">
                                <Link href="/contact"><Phone className="w-4 h-4 mr-2" /> Contact Us</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── STATS ─── */}
            <section className="py-12 bg-white shadow-sm relative -mt-8 mx-4 md:mx-8 lg:mx-16 rounded-2xl z-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-8">
                    {stats.map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-gold-accent">{stat.value}</p>
                            <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── CTA SECTION ─── */}
            {cta && (
                <section className="section-padding bg-cream-bg">
                    <div className="container-wide text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <h2 className="text-3xl md:text-5xl font-bold text-dark-blue mb-4">{cta.headline}</h2>
                            {cta.subtext && <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">{cta.subtext}</p>}
                            <Button asChild size="lg" className="gold-gradient text-navy-primary hover:opacity-90 font-semibold shadow-xl shadow-gold-accent/20 px-10">
                                <Link href={cta.buttonUrl}>{cta.buttonText} <ArrowRight className="w-4 h-4 ml-2" /></Link>
                            </Button>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ─── SERVICES PREVIEW ─── */}
            <section className="section-padding bg-section-gray">
                <div className="container-wide">
                    <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
                        <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">Our Services</motion.h2>
                        <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">Expert architectural and Vastu-compliant planning solutions tailored for every project scale.</motion.p>
                    </motion.div>
                    <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.slice(0, 6).map((service: HomeService) => (
                            <motion.div key={service.id} variants={fadeInUp}>
                                <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group h-full">
                                    <CardContent className="p-6">
                                        <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center mb-4 text-2xl shadow-md">
                                            {service.icon || "📋"}
                                        </div>
                                        <h3 className="text-lg font-bold text-dark-blue mb-2 group-hover:text-gold-accent transition-colors">{service.title}</h3>
                                        <p className="text-muted-foreground text-sm line-clamp-2">{service.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                    <div className="text-center mt-12">
                        <Button asChild variant="outline" className="font-semibold border-navy-primary/20 hover:bg-navy-primary/5 rounded-xl">
                            <Link href="/services">View All Services <ChevronRight className="w-4 h-4 ml-1" /></Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* ─── REFER & EARN SECTION ─── */}
            <ReferralSection />

            {/* ─── CALCULATORS ─── */}
            {
                calculators.length > 0 && (
                    <section className="section-padding bg-white">
                        <div className="container-wide">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">Quick Calculators</h2>
                                <p className="text-muted-foreground max-w-2xl mx-auto">Use our interactive tools to estimate costs and evaluate your project requirements.</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {calculators.map((calc: CalculatorType) => (
                                    <DynamicCalculator key={calc.id} calculator={calc} />
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            {/* ─── PLANS PREVIEW ─── */}
            <section className="section-padding bg-section-gray">
                <div className="container-wide">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">Our Plans</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">Choose from our range of professionally crafted packages.</p>
                    </div>
                    <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.slice(0, 4).map((plan: HomePlan) => {
                            const features = (plan.features as string[]) || [];
                            return (
                                <motion.div key={plan.id} variants={fadeInUp}>
                                    <Card className={`border-0 shadow-sm hover:shadow-lg transition-all h-full ${plan.isFeatured ? "ring-2 ring-gold-accent scale-[1.02]" : ""}`}>
                                        <CardContent className="p-6 flex flex-col h-full">
                                            {plan.isFeatured && <span className="text-xs font-semibold px-3 py-1 rounded-full gold-gradient text-navy-primary self-start mb-2">Popular</span>}
                                            <h3 className="text-lg font-bold text-dark-blue">{plan.name}</h3>
                                            <p className="text-2xl font-bold text-gold-accent my-2">{plan.price}</p>
                                            <ul className="space-y-2 flex-1 mb-4">
                                                {features.slice(0, 4).map((f: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-gold-accent shrink-0" />{f}
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button asChild variant="outline" size="sm" className="w-full border-navy-primary/20 hover:bg-navy-primary/5"><Link href="/plans">View Details</Link></Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ─── INDIA COVERAGE ─── */}
            <section className="section-padding brand-gradient text-white text-center">
                <div className="container-wide">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Serving Across All of India</h2>
                    <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">From metropolitan cities to emerging towns, our services reach every corner of the country.</p>
                    <div className="flex items-center justify-center gap-2 text-gold-accent/80">
                        <MapPin className="w-5 h-5" /> Mumbai • Delhi • Pune • Hyderabad • Lucknow • And {homeData?.address || settings.stats_states || "25+"} States
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS ─── */}
            {
                testimonials.length > 0 && (
                    <section className="section-padding bg-section-gray">
                        <div className="container-wide">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">What Our Clients Say</h2>
                                <p className="text-muted-foreground max-w-2xl mx-auto">Trusted by hundreds of clients across India.</p>
                            </div>
                            <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {testimonials.slice(0, 6).map((t: HomeTestimonial) => (
                                    <motion.div key={t.id} variants={fadeInUp}>
                                        <Card className="border-0 shadow-sm h-full">
                                            <CardContent className="p-6">
                                                <div className="flex gap-0.5 mb-3">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < t.rating ? "fill-gold-accent text-gold-accent" : "text-gray-200"}`} />
                                                    ))}
                                                </div>
                                                <p className="text-muted-foreground text-sm italic mb-4">&ldquo;{t.content}&rdquo;</p>
                                                <div className="flex items-center gap-3 pt-3 border-t">
                                                    <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-gold-accent" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-dark-blue text-sm">{t.name}</p>
                                                        <p className="text-xs text-muted-foreground">{t.role}{t.company ? `, ${t.company} ` : ""}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </section>
                )
            }
            {/* ─── FOOTER CONTENT (Placeholder for dynamic data if needed, but rendered in PublicLayout) ─── */}
        </>
    );
}
