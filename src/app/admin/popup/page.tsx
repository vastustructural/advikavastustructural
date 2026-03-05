"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, Eye, EyeOff, MessageSquare, Link as LinkIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

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

export default function AdminPopupSettings() {
    const [settings, setSettings] = useState<PopupSettings>(defaults);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/popup-settings")
            .then((r) => r.json())
            .then((d) => { setSettings({ ...defaults, ...d }); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const update = (key: keyof PopupSettings, value: string | boolean) =>
        setSettings((prev) => ({ ...prev, [key]: value }));

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/popup-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) toast.success("Popup settings saved!");
            else toast.error("Failed to save settings");
        } catch {
            toast.error("An error occurred");
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-7 h-7 animate-spin text-navy-primary" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-navy-dark tracking-tight">Welcome Popup</h1>
                    <p className="text-muted-foreground text-sm mt-1">Edit the first-time visitor popup shown to users on your website.</p>
                </div>
                <Button onClick={save} disabled={saving} className="bg-navy-primary hover:bg-navy-dark text-white h-11 px-6">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            {/* Enable / Disable toggle */}
            <Card className="border-navy-primary/10 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-navy-dark">Popup Status</p>
                        <p className="text-sm text-muted-foreground">{settings.isEnabled ? "Popup is currently shown to first-time visitors." : "Popup is currently disabled and hidden from all users."}</p>
                    </div>
                    <button
                        onClick={() => update("isEnabled", !settings.isEnabled)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${settings.isEnabled ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                        {settings.isEnabled ? <><ToggleRight className="w-5 h-5" /> Enabled</> : <><ToggleLeft className="w-5 h-5" /> Disabled</>}
                    </button>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Content Settings */}
                <Card className="border-navy-primary/10 shadow-sm">
                    <CardHeader className="bg-gray-50/50 border-b">
                        <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-4 h-4 text-gold-accent" /> Popup Content</CardTitle>
                        <CardDescription>The text shown inside the welcome popup.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-navy-dark text-sm">Badge / Tag Line</Label>
                            <Input value={settings.badge} onChange={(e) => update("badge", e.target.value)} placeholder="✨ Trusted Across India" className="bg-gray-50 border-gray-200 focus:bg-white" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-navy-dark text-sm">Main Title</Label>
                            <Input value={settings.title} onChange={(e) => update("title", e.target.value)} className="bg-gray-50 border-gray-200 focus:bg-white" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-navy-dark text-sm">Subtitle</Label>
                            <Input value={settings.subtitle} onChange={(e) => update("subtitle", e.target.value)} placeholder="Your Dream Home Experts" className="bg-gray-50 border-gray-200 focus:bg-white" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-navy-dark text-sm">Body Message</Label>
                            <Textarea value={settings.message} rows={4} onChange={(e) => update("message", e.target.value)} className="bg-gray-50 border-gray-200 focus:bg-white resize-none" />
                        </div>
                    </CardContent>
                </Card>

                {/* Button Settings */}
                <Card className="border-navy-primary/10 shadow-sm">
                    <CardHeader className="bg-gray-50/50 border-b">
                        <CardTitle className="text-base flex items-center gap-2"><LinkIcon className="w-4 h-4 text-gold-accent" /> Call-to-Action Buttons</CardTitle>
                        <CardDescription>Configure the two action buttons displayed on the popup.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 space-y-5">
                        <div className="space-y-3 p-4 rounded-xl bg-gold-accent/5 border border-gold-accent/20">
                            <p className="text-xs font-bold uppercase tracking-wider text-gold-accent">Primary Button (Gold)</p>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-navy-dark">Button Text</Label>
                                <Input value={settings.primaryButtonText} onChange={(e) => update("primaryButtonText", e.target.value)} placeholder="Explore Free Tools" className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-navy-dark">Button Link (URL)</Label>
                                <Input value={settings.primaryButtonUrl} onChange={(e) => update("primaryButtonUrl", e.target.value)} placeholder="/tools" className="bg-white border-gray-200 font-mono text-sm" />
                            </div>
                        </div>

                        <div className="space-y-3 p-4 rounded-xl bg-navy-primary/5 border border-navy-primary/10">
                            <p className="text-xs font-bold uppercase tracking-wider text-navy-primary">Secondary Button (Dark)</p>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-navy-dark">Button Text</Label>
                                <Input value={settings.secondaryButtonText} onChange={(e) => update("secondaryButtonText", e.target.value)} placeholder="Get Expert Advice" className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-navy-dark">Button Link (URL)</Label>
                                <Input value={settings.secondaryButtonUrl} onChange={(e) => update("secondaryButtonUrl", e.target.value)} placeholder="/contact" className="bg-white border-gray-200 font-mono text-sm" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview */}
            <Card className="border-navy-primary/10 shadow-sm">
                <CardHeader className="bg-gray-50/50 border-b">
                    <CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4 text-gold-accent" /> Live Preview</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex justify-center">
                    <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                        <div className="brand-gradient p-6 text-center relative">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-gold-accent text-xs font-semibold mb-3">
                                {settings.badge}
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gold-accent/20 flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">✨</span>
                            </div>
                            <h3 className="text-lg font-bold text-white leading-snug">{settings.title}</h3>
                            <p className="text-gold-accent font-semibold text-xs mt-1">{settings.subtitle}</p>
                        </div>
                        <div className="p-5 bg-white">
                            <p className="text-slate-500 text-xs text-center mb-4 leading-relaxed">{settings.message}</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gold-gradient text-navy-primary font-bold text-xs">
                                    {settings.primaryButtonText}
                                </div>
                                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-dark text-white font-semibold text-xs">
                                    {settings.secondaryButtonText}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
