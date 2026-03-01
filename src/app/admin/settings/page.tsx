"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Check } from "lucide-react";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => { fetchSettings(); }, []);

    async function fetchSettings() {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        setSettings(await res.json());
        setLoading(false);
    }

    function update(key: string, value: any) {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }

    async function saveSettings() {
        setSaving(true);
        await fetch("/api/admin/settings", {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-sky-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-dark-blue">Site Settings</h1>
                    <p className="text-muted-foreground text-sm">Configure global website settings.</p>
                </div>
                <Button onClick={saveSettings} disabled={saving} className="sky-gradient text-white gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? "Saved!" : "Save All"}
                </Button>
            </div>

            {/* Company Info */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <h2 className="font-semibold text-dark-blue text-lg">Company Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Company Name</Label><Input value={settings.company_name || ""} onChange={(e) => update("company_name", e.target.value)} /></div>
                        <div><Label>Tagline</Label><Input value={settings.tagline || ""} onChange={(e) => update("tagline", e.target.value)} /></div>
                        <div><Label>Email</Label><Input value={settings.email || ""} onChange={(e) => update("email", e.target.value)} /></div>
                        <div><Label>Secondary Email</Label><Input value={settings.email_2 || ""} onChange={(e) => update("email_2", e.target.value)} /></div>
                        <div><Label>Phone</Label><Input value={settings.phone || ""} onChange={(e) => update("phone", e.target.value)} /></div>
                        <div><Label>Secondary Phone</Label><Input value={settings.phone_2 || ""} onChange={(e) => update("phone_2", e.target.value)} /></div>
                        <div><Label>WhatsApp</Label><Input value={settings.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} /></div>
                        <div><Label>Address</Label><Input value={settings.address || ""} onChange={(e) => update("address", e.target.value)} /></div>
                        <div><Label>Working Hours</Label><Input value={settings.working_hours || ""} placeholder="Mon – Sat: 9:00 AM – 7:00 PM" onChange={(e) => update("working_hours", e.target.value)} /></div>
                        <div><Label>Working Days Off</Label><Input value={settings.working_days_off || ""} placeholder="Sunday: Closed" onChange={(e) => update("working_days_off", e.target.value)} /></div>
                    </div>
                </CardContent>
            </Card>

            {/* Hero Section */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <h2 className="font-semibold text-dark-blue text-lg">Hero Section</h2>
                    <div><Label>Hero Title</Label><Input value={settings.hero_title || ""} onChange={(e) => update("hero_title", e.target.value)} /></div>
                    <div><Label>Hero Subtitle</Label><Textarea rows={2} value={settings.hero_subtitle || ""} onChange={(e) => update("hero_subtitle", e.target.value)} /></div>
                </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <h2 className="font-semibold text-dark-blue text-lg">Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><Label>Clients</Label><Input value={settings.stats_clients || ""} onChange={(e) => update("stats_clients", e.target.value)} /></div>
                        <div><Label>Projects</Label><Input value={settings.stats_projects || ""} onChange={(e) => update("stats_projects", e.target.value)} /></div>
                        <div><Label>Experience</Label><Input value={settings.stats_experience || ""} onChange={(e) => update("stats_experience", e.target.value)} /></div>
                        <div><Label>States</Label><Input value={settings.stats_states || ""} onChange={(e) => update("stats_states", e.target.value)} /></div>
                    </div>
                </CardContent>
            </Card>

            {/* About / Founder */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <h2 className="font-semibold text-dark-blue text-lg">About & Founder</h2>
                    <div><Label>About Introduction</Label><Textarea rows={3} value={settings.about_intro || ""} onChange={(e) => update("about_intro", e.target.value)} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Founder Name</Label><Input value={settings.founder_name || ""} onChange={(e) => update("founder_name", e.target.value)} /></div>
                        <div><Label>Founder Role</Label><Input value={settings.founder_role || ""} onChange={(e) => update("founder_role", e.target.value)} /></div>
                    </div>
                    <div><Label>Founder Bio</Label><Textarea rows={3} value={settings.founder_bio || ""} onChange={(e) => update("founder_bio", e.target.value)} /></div>
                    <div><Label>Mission</Label><Textarea rows={2} value={settings.mission || ""} onChange={(e) => update("mission", e.target.value)} /></div>
                    <div><Label>Vision</Label><Textarea rows={2} value={settings.vision || ""} onChange={(e) => update("vision", e.target.value)} /></div>
                </CardContent>
            </Card>

            {/* Referral */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <h2 className="font-semibold text-dark-blue text-lg">Referral Section</h2>
                    <div><Label>Title</Label><Input value={settings.referral_title || ""} onChange={(e) => update("referral_title", e.target.value)} /></div>
                    <div><Label>Description</Label><Textarea rows={2} value={settings.referral_description || ""} onChange={(e) => update("referral_description", e.target.value)} /></div>
                </CardContent>
            </Card>

            {/* Toggles */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <h2 className="font-semibold text-dark-blue text-lg">Features</h2>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={settings.popup_enabled ?? true} onChange={(e) => update("popup_enabled", e.target.checked)} className="w-4 h-4" />
                            <span className="text-sm">Welcome Popup</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={settings.chatbot_enabled ?? true} onChange={(e) => update("chatbot_enabled", e.target.checked)} className="w-4 h-4" />
                            <span className="text-sm">Chatbot</span>
                        </label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
