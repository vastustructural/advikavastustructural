"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    BarChart3, Home, Wrench, CreditCard, PackageSearch, Image, MessageSquare, Star, FileText, Settings,
    Calculator, Megaphone, MessageCircle, Menu, X, LogOut, ChevronRight, Users, IndianRupee, Layout,
} from "lucide-react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/home", label: "Home", icon: Home },
    { href: "/admin/popup", label: "Welcome Popup", icon: Layout },
    { href: "/admin/calculators", label: "Calculators", icon: Calculator },
    { href: "/admin/cta", label: "CTA Section", icon: Megaphone },
    { href: "/admin/referrals", label: "Referrals", icon: Users },
    { href: "/admin/payments", label: "Payments", icon: IndianRupee },
    { href: "/admin/chatbot-logs", label: "Chat Leads", icon: MessageCircle },
    { href: "/admin/services", label: "Services", icon: Wrench },
    { href: "/admin/plans", label: "Plans", icon: CreditCard },
    { href: "/admin/products", label: "Products", icon: PackageSearch },
    { href: "/admin/gallery", label: "Gallery", icon: Image },
    { href: "/admin/testimonials", label: "Google Reviews", icon: Star },
    { href: "/admin/contact", label: "Contact", icon: MessageSquare },
    { href: "/admin/legal", label: "Legal Pages", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (pathname === "/admin/login") return <>{children}</>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0F1B2D] transform transition-transform duration-200 z-40 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
                {/* Logo */}
                <div className="p-5 flex items-center gap-3 border-b border-white/10">
                    <div className="w-9 h-9 rounded-lg bg-[#C5A55A]/20 flex items-center justify-center">
                        <span className="text-[#C5A55A] font-bold text-lg">A</span>
                    </div>
                    <div>
                        <span className="text-white font-bold text-sm block leading-tight">Advika Admin</span>
                        <span className="text-[#C5A55A] text-[10px] font-medium tracking-wider uppercase">Control Panel</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/40 hover:text-white lg:hidden">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive
                                    ? "bg-[#C5A55A]/10 text-[#C5A55A] font-medium"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon className="w-4.5 h-4.5" />
                                <span>{item.label}</span>
                                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-white/10">
                    <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut className="w-4.5 h-4.5" /> Sign Out
                    </Link>
                </div>
            </aside>

            {/* Backdrop */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="bg-white border-b h-14 flex items-center px-4 sticky top-0 z-20 lg:px-6">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="ml-auto flex items-center gap-3">
                        <Link href="/" className="text-xs text-gray-400 hover:text-[#C5A55A] transition-colors">View Site →</Link>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
