"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Sparkles, Calculator, Phone, ChevronRight } from "lucide-react";

interface PopupSettings {
    title: string;
    subtitle: string;
    badge: string;
    message: string;
    primaryButtonText: string;
    primaryButtonUrl: string;
    secondaryButtonText: string;
    secondaryButtonUrl: string;
    isEnabled: boolean;
}

const defaults: PopupSettings = {
    title: "Welcome to Advika Vastu-Structural",
    subtitle: "Your Dream Home Experts",
    badge: "✨ Trusted Across India",
    message: "Get expert architectural planning, Vastu-compliant designs, and structural consultancy — all tailored for your dream home project.",
    primaryButtonText: "Explore Free Tools",
    primaryButtonUrl: "/tools",
    secondaryButtonText: "Get Expert Advice",
    secondaryButtonUrl: "/contact",
    isEnabled: true,
};

export default function WelcomePopup() {
    const [show, setShow] = useState(false);
    const [settings, setSettings] = useState<PopupSettings>(defaults);

    useEffect(() => {
        const alreadyShown = sessionStorage.getItem("advika-popup-v2");
        if (alreadyShown) return;

        // Fetch admin-configured settings
        fetch("/api/admin/popup-settings")
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data) setSettings({ ...defaults, ...data });
                if (data?.isEnabled !== false) {
                    const timer = setTimeout(() => setShow(true), 2200);
                    return () => clearTimeout(timer);
                }
            })
            .catch(() => {
                const timer = setTimeout(() => setShow(true), 2200);
                return () => clearTimeout(timer);
            });
    }, []);

    const close = () => {
        setShow(false);
        sessionStorage.setItem("advika-popup-v2", "true");
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 20 }}
                        transition={{ type: "spring", stiffness: 320, damping: 26 }}
                        className="fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[440px]"
                    >
                        <div className="rounded-3xl overflow-hidden shadow-2xl bg-white">
                            {/* Header gradient */}
                            <div className="brand-gradient p-7 text-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-gold-accent blur-2xl" />
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white blur-2xl" />
                                </div>
                                <button
                                    onClick={close}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>

                                {/* Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-gold-accent text-xs font-semibold mb-4">
                                    {settings.badge}
                                </div>

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-gold-accent/20 border border-gold-accent/30 flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-gold-accent" />
                                </div>

                                <h2 className="text-2xl font-bold text-white leading-tight">{settings.title}</h2>
                                <p className="text-gold-accent font-semibold text-sm mt-1">{settings.subtitle}</p>
                            </div>

                            {/* Body */}
                            <div className="p-7">
                                <p className="text-slate-600 text-sm leading-relaxed text-center mb-6">
                                    {settings.message}
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col gap-3">
                                    {/* Primary: Explore Tools */}
                                    <Link
                                        href={settings.primaryButtonUrl}
                                        onClick={close}
                                        className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl gold-gradient text-navy-primary font-bold hover:opacity-90 transition-all shadow-md text-sm group"
                                    >
                                        <Calculator className="w-4 h-4 shrink-0" />
                                        {settings.primaryButtonText}
                                        <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>

                                    {/* Secondary: Contact Expert */}
                                    <Link
                                        href={settings.secondaryButtonUrl}
                                        onClick={close}
                                        className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-navy-dark text-white font-semibold hover:bg-navy-primary transition-all text-sm group"
                                    >
                                        <Phone className="w-4 h-4 shrink-0" />
                                        {settings.secondaryButtonText}
                                        <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>

                                {/* Dismiss */}
                                <button onClick={close} className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-4 transition-colors">
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
