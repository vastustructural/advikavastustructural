"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    CheckCircle2,
    MessageCircle,
    ArrowRight
} from "lucide-react";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
};

const stagger = {
    animate: { transition: { staggerChildren: 0.15 } },
};

interface Settings {
    email?: string;
    phone?: string;
    address?: string;
    workingHours?: string;
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
    };
}

interface ContactContentProps {
    settings: Settings;
}

export default function ContactContent({ settings }: ContactContentProps) {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const form = e.currentTarget;
        const data = {
            name: (form.elements.namedItem("name") as HTMLInputElement).value,
            email: (form.elements.namedItem("email") as HTMLInputElement).value,
            phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
            subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
            message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
        };
        try {
            await fetch("/api/admin/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            setSubmitted(true);
        } catch {
            alert("Failed to send message. Please try again.");
        }
        setLoading(false);
    };

    const phoneList = settings.phone ? [settings.phone] : [];
    const emailList = settings.email ? [settings.email] : [];
    const activePhone = phoneList[0] || "+91 9284242634";

    // Fallbacks
    const fallbackAddress = "Plot No -04, Om Sai Nagar, Besa, / Nagpur - 440027";
    const fallbackHours = "Monday - Saturday: / 10:00 AM - 6:00 PM";

    const contactInfo = [
        {
            icon: Phone,
            title: "Phone",
            details: phoneList.length > 0 ? phoneList : ["+91 9284242634"],
            action: `tel:${activePhone.replace(/[^0-9+]/g, '')}`,
        },
        {
            icon: Mail,
            title: "Email",
            details: emailList.length > 0 ? emailList : ["admin@advikavastustructural.com"],
            action: `mailto:${emailList[0] || "admin@advikavastustructural.com"}`,
        },
        {
            icon: Clock,
            title: "Working Hours",
            details: settings.workingHours ? settings.workingHours.split("/ ") : fallbackHours.split("/ "),
            action: null,
        },
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Premium Hero Banner */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-dark-blue">
                {/* Abstract Background Shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-sky-primary/10 blur-[120px] translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-sky-primary/5 blur-[100px] -translate-x-1/3 translate-y-1/3" />
                </div>

                <div className="container-wide relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-100 text-sm font-medium mb-6"
                        >
                            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                            We are online and ready to help
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white tracking-tight">
                            Let&apos;s build something <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-300">extraordinary</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                            Have a project in mind? Our structural experts and architectural visionaries are here to turn your ideas into reality.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Contact Section */}
            <section className="relative -mt-16 pb-24 z-20">
                <div className="container-wide">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={stagger}
                        className="grid lg:grid-cols-12 gap-8 lg:gap-12"
                    >
                        {/* Contact Form */}
                        <motion.div variants={fadeInUp} className="lg:col-span-7 xl:col-span-8">
                            <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white/90 backdrop-blur-xl ring-1 ring-slate-100 overflow-hidden">
                                <CardContent className="p-8 md:p-12 relative">
                                    <AnimatePresence mode="wait">
                                        {submitted ? (
                                            <motion.div
                                                key="success"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="text-center py-16 md:py-24"
                                            >
                                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                                </div>
                                                <h3 className="text-3xl font-bold text-dark-blue mb-4 tracking-tight">Message Received!</h3>
                                                <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                                                    We appreciate you reaching out. Our team will review your inquiry and get back to you shortly.
                                                </p>
                                                <Button
                                                    onClick={() => setSubmitted(false)}
                                                    variant="outline"
                                                    className="rounded-full px-8 py-6 border-slate-200 hover:bg-slate-50 text-dark-blue font-medium"
                                                >
                                                    Send Another Message
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="form"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <div className="mb-10">
                                                    <h3 className="text-3xl font-bold text-dark-blue mb-3 tracking-tight">Send us a Message</h3>
                                                    <p className="text-slate-500 text-lg">We&apos;ll get back to you within 24 hours.</p>
                                                </div>
                                                <form onSubmit={handleSubmit} className="space-y-6">
                                                    <div className="grid sm:grid-cols-2 gap-6">
                                                        <div className="space-y-2.5">
                                                            <Label htmlFor="name" className="text-slate-700 font-medium">Full Name <span className="text-red-500">*</span></Label>
                                                            <Input id="name" placeholder="John Doe" required className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors" />
                                                        </div>
                                                        <div className="space-y-2.5">
                                                            <Label htmlFor="email" className="text-slate-700 font-medium">Email Address <span className="text-red-500">*</span></Label>
                                                            <Input id="email" type="email" placeholder="john@example.com" required className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors" />
                                                        </div>
                                                    </div>
                                                    <div className="grid sm:grid-cols-2 gap-6">
                                                        <div className="space-y-2.5">
                                                            <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                                                            <Input id="phone" placeholder="+91 90000 00000" className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors" />
                                                        </div>
                                                        <div className="space-y-2.5">
                                                            <Label htmlFor="subject" className="text-slate-700 font-medium">Subject</Label>
                                                            <Input id="subject" placeholder="How can we help?" className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <Label htmlFor="message" className="text-slate-700 font-medium">Message <span className="text-red-500">*</span></Label>
                                                        <Textarea
                                                            id="message"
                                                            placeholder="Tell us a little about your project or inquiry..."
                                                            rows={6}
                                                            required
                                                            className="resize-none bg-slate-50/50 border-slate-200 focus:bg-white transition-colors p-4"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="w-full bg-dark-blue hover:bg-dark-blue/90 text-white rounded-xl h-14 text-lg font-medium tracking-wide shadow-lg shadow-dark-blue/20 transition-all active:scale-[0.98]"
                                                    >
                                                        {loading ? (
                                                            <span className="flex items-center justify-center gap-3">
                                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                Sending Message...
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center justify-center gap-2">
                                                                Send Message
                                                                <ArrowRight className="w-5 h-5 ml-1" />
                                                            </span>
                                                        )}
                                                    </Button>
                                                </form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Contact Info Sidebar */}
                        <motion.div variants={fadeInUp} className="lg:col-span-5 xl:col-span-4 space-y-6">
                            {contactInfo.map((info, idx) => (
                                <Card key={info.title} className="border-0 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-shadow bg-white overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none">
                                        <info.icon className="w-32 h-32" />
                                    </div>
                                    <CardContent className="p-6 md:p-8 relative">
                                        <div className="flex items-start gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0">
                                                <info.icon className="w-6 h-6 text-sky-600" />
                                            </div>
                                            <div className="flex-1 space-y-1 pt-1.5">
                                                <h4 className="font-bold text-dark-blue text-lg tracking-tight">{info.title}</h4>
                                                <div className="space-y-1.5 pt-2">
                                                    {info.details.map((detail, index) => (
                                                        <p key={index} className="text-slate-600 leading-relaxed">
                                                            {info.action && index === 0 ? (
                                                                <a href={info.action} className="hover:text-sky-600 transition-colors">
                                                                    {detail}
                                                                </a>
                                                            ) : (
                                                                detail
                                                            )}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* WhatsApp Direct CTA */}
                            <motion.div variants={fadeInUp} className="pt-2">
                                <a
                                    href={`https://wa.me/${activePhone.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%27m%20interested%20in%20your%20services`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-6 rounded-2xl bg-[#25D366] text-white shadow-xl shadow-[#25D366]/20 hover:bg-[#20bd5a] transition-colors overflow-hidden relative"
                                >
                                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <MessageCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">Chat on WhatsApp</p>
                                            <p className="text-white/80 text-sm font-medium">Fastest response time</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
