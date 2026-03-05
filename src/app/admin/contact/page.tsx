"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Mail, MailOpen, Loader2, Save, MapPin, Phone, Clock, Facebook, Instagram, Twitter, Linkedin, Search } from "lucide-react";
import { toast } from "sonner";

interface Submission {
    id: string; name: string; email: string; phone: string; subject: string;
    message: string; isRead: boolean; createdAt: string;
}

interface ContactSettings {
    email: string;
    phone: string;
    address: string;
    workingHours: string;
    socialLinks: { facebook: string; instagram: string; linkedin: string; twitter: string; };
}

export default function AdminContactPage() {
    // Shared State
    const [loading, setLoading] = useState(true);

    // Inquiries State
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    // Settings State
    const [settings, setSettings] = useState<ContactSettings>({
        email: "", phone: "", address: "", workingHours: "",
        socialLinks: { facebook: "", instagram: "", linkedin: "", twitter: "" }
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [subsRes, settingsRes] = await Promise.all([
                fetch("/api/admin/contact"),
                fetch("/api/admin/contact-settings")
            ]);

            if (subsRes.ok) setSubmissions(await subsRes.json());
            if (settingsRes.ok) setSettings(await settingsRes.json());
        } catch (error) {
            toast.error("Failed to load data");
        }
        setLoading(false);
    }

    // --- Inquiries Functions ---
    async function toggleRead(id: string, isRead: boolean) {
        // Optimistic UI update could go here
        try {
            await fetch(`/api/admin/contact/${id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: !isRead }),
            });
            await fetchData();
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    async function removeSubmission(id: string) {
        if (!confirm("Are you sure you want to delete this submission forever?")) return;
        try {
            await fetch(`/api/admin/contact?id=${id}`, { method: "DELETE" });
            toast.success("Submission deleted");
            await fetchData();
        } catch (error) {
            toast.error("Failed to delete submission");
        }
    }

    // --- Settings Functions ---
    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('social_')) {
            const platform = name.split('_')[1];
            setSettings(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, [platform]: value }
            }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    async function saveSettings(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/contact-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                toast.success("Contact settings saved successfully");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (error) {
            toast.error("An error occurred while saving");
        }
        setSaving(false);
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-navy-primary" /></div>;

    const unreadCount = submissions.filter((s) => !s.isRead).length;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-navy-dark tracking-tight">Contact Management</h1>
                <p className="text-muted-foreground text-sm mt-1">Manage public contact details and respond to customer inquiries.</p>
            </div>

            <Tabs defaultValue="inquiries" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md bg-navy-primary/5 p-1 rounded-xl">
                    <TabsTrigger value="inquiries" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-navy-primary data-[state=active]:shadow-sm transition-all">
                        Inquiries {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-navy-primary data-[state=active]:shadow-sm transition-all">
                        Page Settings
                    </TabsTrigger>
                </TabsList>

                {/* --- INQUIRIES TAB --- */}
                <TabsContent value="inquiries" className="mt-6">
                    <div className="bg-white border border-navy-primary/10 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                            <h2 className="font-semibold text-navy-dark flex items-center gap-2"><Mail className="w-4 h-4" /> Message Inbox</h2>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Search messages..." className="pl-9 h-9 w-64 bg-white border-gray-200" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                            {submissions.map((s) => (
                                <Card key={s.id} className={`border border-navy-primary/5 shadow-sm transition-all hover:shadow-md ${!s.isRead ? "bg-white border-l-4 border-l-gold-accent" : "bg-gray-50/50 opacity-80"}`}>
                                    <div className="p-5 flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-navy-primary/5 flex items-center justify-center text-navy-primary font-bold">
                                                        {s.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-navy-dark text-base flex items-center gap-2">
                                                            {s.name}
                                                            {!s.isRead && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-gold-accent text-navy-dark font-bold">New</span>}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email}</span>
                                                            {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                                                    <Clock className="w-3 h-3" /> {new Date(s.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                            </div>

                                            <div className="pl-13 ml-13 border-l-2 border-gray-100 py-1 px-4">
                                                {s.subject && <h4 className="font-semibold text-sm text-navy-dark mb-1">{s.subject}</h4>}
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{s.message}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col justify-end md:justify-start gap-2 pt-2 md:pt-0">
                                            <Button variant="outline" size="sm" className="h-8 w-8 md:w-full md:justify-start bg-white" onClick={() => toggleRead(s.id, s.isRead)}>
                                                {s.isRead ? <Mail className="w-4 h-4 md:mr-2" /> : <MailOpen className="w-4 h-4 md:mr-2" />}
                                                <span className="hidden md:inline">{s.isRead ? "Mark Unread" : "Mark Read"}</span>
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 w-8 md:w-full md:justify-start text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 bg-white" onClick={() => removeSubmission(s.id)}>
                                                <Trash2 className="w-4 h-4 md:mr-2" />
                                                <span className="hidden md:inline">Delete</span>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {submissions.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-16 h-16 rounded-full bg-cream-bg flex items-center justify-center mb-4">
                                        <Mail className="w-8 h-8 text-gold-accent opacity-50" />
                                    </div>
                                    <p className="text-lg font-bold text-navy-dark">Inbox Zero</p>
                                    <p className="text-sm text-muted-foreground">You have no contact submissions at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* --- SETTINGS TAB --- */}
                <TabsContent value="settings" className="mt-6">
                    <form onSubmit={saveSettings}>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <Card className="border-navy-primary/10 shadow-sm">
                                    <CardHeader className="bg-gray-50/50 border-b">
                                        <CardTitle className="text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-gold-accent" /> Primary Details</CardTitle>
                                        <CardDescription>Main contact information displayed on the website.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="font-semibold text-navy-dark">Support Email *</Label>
                                            <Input id="email" name="email" type="email" required value={settings.email} onChange={handleSettingsChange} className="bg-gray-50 border-gray-200 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="font-semibold text-navy-dark">Primary Phone</Label>
                                            <Input id="phone" name="phone" value={settings.phone} onChange={handleSettingsChange} placeholder="+91 XXXXX XXXXX" className="bg-gray-50 border-gray-200 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="workingHours" className="font-semibold text-navy-dark">Working Hours</Label>
                                            <Input id="workingHours" name="workingHours" value={settings.workingHours} onChange={handleSettingsChange} placeholder="Mon-Sat: 10AM - 6PM" className="bg-gray-50 border-gray-200 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="font-semibold text-navy-dark">Office Address</Label>
                                            <Input id="address" name="address" value={settings.address} onChange={handleSettingsChange} className="bg-gray-50 border-gray-200 focus:bg-white" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="border-navy-primary/10 shadow-sm">
                                    <CardHeader className="bg-gray-50/50 border-b">
                                        <CardTitle className="text-lg flex items-center gap-2"><Facebook className="w-5 h-5 text-gold-accent" /> Social Links</CardTitle>
                                        <CardDescription>URLs for your company social media profiles.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-2 relative">
                                            <Label htmlFor="social_facebook" className="font-semibold text-navy-dark flex items-center gap-2"><Facebook className="w-4 h-4 text-[#1877F2]" /> Facebook URL</Label>
                                            <Input id="social_facebook" name="social_facebook" value={settings.socialLinks?.facebook || ""} onChange={handleSettingsChange} placeholder="https://facebook.com/..." className="bg-gray-50 border-gray-200 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2 relative">
                                            <Label htmlFor="social_instagram" className="font-semibold text-navy-dark flex items-center gap-2"><Instagram className="w-4 h-4 text-[#E4405F]" /> Instagram URL</Label>
                                            <Input id="social_instagram" name="social_instagram" value={settings.socialLinks?.instagram || ""} onChange={handleSettingsChange} placeholder="https://instagram.com/..." className="bg-gray-50 border-gray-200 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2 relative">
                                            <Label htmlFor="social_twitter" className="font-semibold text-navy-dark flex items-center gap-2"><Twitter className="w-4 h-4 text-[#1DA1F2]" /> Twitter URL</Label>
                                            <Input id="social_twitter" name="social_twitter" value={settings.socialLinks?.twitter || ""} onChange={handleSettingsChange} placeholder="https://x.com/..." className="bg-gray-50 border-gray-200 focus:bg-white" />
                                        </div>
                                        <div className="space-y-2 relative">
                                            <Label htmlFor="social_linkedin" className="font-semibold text-navy-dark flex items-center gap-2"><Linkedin className="w-4 h-4 text-[#0A66C2]" /> LinkedIn URL</Label>
                                            <Input id="social_linkedin" name="social_linkedin" value={settings.socialLinks?.linkedin || ""} onChange={handleSettingsChange} placeholder="https://linkedin.com/..." className="bg-gray-50 border-gray-200 focus:bg-white" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={saving} className="bg-navy-primary hover:bg-navy-dark text-white shadow-lg w-full md:w-auto h-12 px-8 text-base">
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    );
}
