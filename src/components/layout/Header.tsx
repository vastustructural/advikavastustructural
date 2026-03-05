"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, Phone, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { HomePageData } from "@/lib/types/home";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/plans", label: "Plans" },
    { href: "/shop", label: "Shop" },
    { href: "/tools", label: "Tools" },
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export default function Header({ homeData }: { homeData?: HomePageData | null }) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const email = homeData?.contactEmail || "admin@vastustructural.com";
    const phone = homeData?.contactPhone || "+91 90679 69756";
    const whatsappNumber = homeData?.whatsappNumber || phone;
    const whatsappDigits = whatsappNumber.replace(/\D/g, "");
    const whatsappUrl = whatsappDigits
        ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent("Hello, I want to connect with your team.")}`
        : "/contact";
    const title = homeData?.headerTitle || "Advika Vastu Structural";
    const tagline = homeData?.headerSubtitle || "Architecture | Structural | Vastu";

    useEffect(() => {
        setIsMounted(true);
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            {/* Top Bar */}
            <div className="bg-navy-dark text-white/80 text-xs py-1.5 hidden md:block">
                <div className="container-wide flex justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1 hover:text-gold-accent transition-colors"><Phone className="w-3 h-3" /> {phone}</a>
                        <a href={`mailto:${email}`} className="flex items-center gap-1 hover:text-gold-accent transition-colors"><Mail className="w-3 h-3" /> {email}</a>
                    </div>
                    <p>{tagline}</p>
                </div>
            </div>

            {/* Main Header */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white"}`}>
                <div className="container-wide flex items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-3 group">

                        <img src="/logo.jpeg" alt={`${title} Logo`} className="h-10 w-auto" />
                        <div>
                            <span className="text-lg font-bold text-dark-blue block leading-tight">{title}</span>

                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="px-3 py-2 text-sm font-medium text-dark-blue/80 hover:text-gold-accent transition-colors rounded-lg hover:bg-navy-primary/5">
                                {link.label}
                            </Link>
                        ))}
                        <Button asChild size="sm" className="ml-2 gold-gradient text-navy-primary font-semibold hover:opacity-90 shadow-sm">
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                Connect Now <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </a>
                        </Button>
                    </nav>

                    {/* Mobile Menu */}
                    {isMounted ? (
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild className="lg:hidden">
                                <Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72 p-0">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <div className="brand-gradient p-6">
                                    <span className="text-lg font-bold text-white">{title}</span>
                                    <span className="text-xs text-gold-accent block mt-0.5">{homeData?.headerSubtitle || "SAAS Solutions"}</span>
                                </div>
                                <nav className="p-4 space-y-1">
                                    {navLinks.map((link) => (
                                        <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-dark-blue hover:bg-cream-bg hover:text-gold-accent transition-all">
                                            {link.label}
                                        </Link>
                                    ))}
                                    <div className="pt-4">
                                        <Button asChild className="w-full gold-gradient text-navy-primary font-semibold" onClick={() => setOpen(false)}>
                                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Connect Now</a>
                                        </Button>
                                    </div>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    ) : (
                        <div className="lg:hidden w-10 h-10" />
                    )}
                </div>
            </header>
        </>
    );
}
