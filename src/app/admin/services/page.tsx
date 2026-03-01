"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, ArrowUp, ArrowDown, Loader2, Upload, X, IndianRupee, ImageIcon, ListChecks, HelpCircle, Sparkles, Package, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Service {
    id: string; title: string; slug: string; description: string; icon: string;
    price?: string; originalPrice?: string; sampleImageUrl?: string; sampleDocumentUrl?: string; inclusions?: string[];
    processSteps: string[]; deliverables: string[]; order: number; isVisible: boolean;
}

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Service>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchServices(); }, []);

    async function fetchServices() {
        setLoading(true);
        const res = await fetch("/api/admin/services");
        const data = await res.json();

        const parsedData = data.map((s: any) => ({
            ...s,
            inclusions: s.inclusions || [],
            processSteps: s.processSteps || [],
            deliverables: s.deliverables || []
        }));

        setServices(parsedData);
        setLoading(false);
    }

    async function addService() {
        setSaving(true);
        const res = await fetch("/api/admin/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "New Service",
                description: "Basic description of the new service.",
                icon: "📋",
                order: services.length,
                inclusions: [],
                processSteps: [],
                deliverables: []
            }),
        });
        if (res.ok) await fetchServices();
        setSaving(false);
    }

    async function updateService(id: string, data: Partial<Service>) {
        setSaving(true);
        await fetch(`/api/admin/services/${id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
        await fetchServices();
        setSaving(false);
        setEditingId(null);
    }

    async function deleteService(id: string) {
        if (!confirm("Delete this service?")) return;
        await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
        await fetchServices();
    }

    async function toggleVisibility(id: string, current: boolean) {
        await updateService(id, { isVisible: !current });
    }

    async function moveService(id: string, direction: "up" | "down") {
        const idx = services.findIndex((s) => s.id === id);
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= services.length) return;

        await Promise.all([
            fetch(`/api/admin/services/${services[idx].id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: services[swapIdx].order }),
            }),
            fetch(`/api/admin/services/${services[swapIdx].id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: services[idx].order }),
            }),
        ]);
        await fetchServices();
    }

    async function handleSampleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "services");

            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Upload failed");
            }
            const { url } = await res.json();
            setEditForm(prev => ({ ...prev, sampleImageUrl: url }));
            toast.success("Sample image uploaded");
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingDoc(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "service_samples");

            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Upload failed");
            }
            const { url } = await res.json();
            setEditForm(prev => ({ ...prev, sampleDocumentUrl: url }));
            toast.success("Document uploaded");
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploadingDoc(false);
            if (docInputRef.current) docInputRef.current.value = "";
        }
    }

    function openEdit(service: Service) {
        setEditForm({
            ...service,
            inclusions: service.inclusions || [],
            processSteps: service.processSteps || [],
            deliverables: service.deliverables || []
        });
        setEditingId(service.id);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-sky-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-dark-blue tracking-tight">Services Portfolio</h1>
                    <p className="text-muted-foreground text-sm font-medium">Manage your professional service offerings, pricing, and project deliverables.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={addService} disabled={saving} size="lg" className="sky-gradient text-white font-black px-6 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all gap-2">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Create New Service
                    </Button>
                </div>
            </div>

            {/* Performance Stats/Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-sky-50/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sky-primary shadow-sm"><Package className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-sky-primary/60 tracking-widest">Total</p>
                            <p className="text-xl font-black text-dark-blue">{services.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-green-50/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-600 shadow-sm"><Eye className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-green-600/60 tracking-widest">Visible</p>
                            <p className="text-xl font-black text-dark-blue">{services.filter(s => s.isVisible).length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-orange-50/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm"><IndianRupee className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-orange-600/60 tracking-widest">Priced</p>
                            <p className="text-xl font-black text-dark-blue">{services.filter(s => s.price).length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-purple-50/50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm"><ImageIcon className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-purple-600/60 tracking-widest">Samples</p>
                            <p className="text-xl font-black text-dark-blue">{services.filter(s => s.sampleImageUrl).length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Services List */}
            <div className="space-y-4">
                {services.map((service, idx) => (
                    <Card key={service.id} className={`group border border-border/50 shadow-sm hover:shadow-md transition-all ${!service.isVisible ? "bg-muted/30" : "bg-white"}`}>
                        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Reorder and Icon */}
                            <div className="flex items-center gap-4 shrink-0">
                                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-navy-primary transition-colors hidden md:block" />
                                <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center text-2xl shadow-inner ring-1 ring-white/20">
                                    {service.icon || "📋"}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="text-lg font-black text-dark-blue tracking-tight">{service.title}</h3>
                                    <div className="flex items-center gap-1.5">
                                        {service.isVisible ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] font-black uppercase tracking-wider">Public</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-wider">Hidden</Badge>
                                        )}
                                        {!service.price && <Badge variant="destructive" className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 text-[10px] font-black uppercase tracking-wider">No Price</Badge>}
                                        {!service.sampleImageUrl && <Badge variant="outline" className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">No Sample</Badge>}
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm line-clamp-1 font-medium">{service.description}</p>

                                <div className="flex items-center gap-4 pt-1">
                                    {service.price ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-sky-primary flex items-center gap-0.5">
                                                <IndianRupee className="w-3 h-3" />{service.price}
                                            </span>
                                            {service.originalPrice && (
                                                <span className="text-[10px] font-bold text-muted-foreground/60 line-through">₹{service.originalPrice}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Request Quote</span>
                                    )}
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60">
                                        <ListChecks className="w-3 h-3" /> {service.inclusions?.length || 0} Inclusions
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-auto md:ml-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                                <div className="flex items-center bg-muted/50 rounded-xl p-1 gap-1 mr-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm" onClick={() => moveService(service.id, "up")} disabled={idx === 0}>
                                        <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm" onClick={() => moveService(service.id, "down")} disabled={idx === services.length - 1}>
                                        <ArrowDown className="w-4 h-4" />
                                    </Button>
                                </div>

                                <Button variant="ghost" size="icon" className={`h-10 w-10 text-navy-primary hover:bg-navy-primary/5 rounded-xl ${!service.isVisible ? "text-muted-foreground" : ""}`} onClick={() => toggleVisibility(service.id, service.isVisible)}>
                                    {service.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </Button>

                                <Dialog open={editingId === service.id} onOpenChange={(open) => { if (!open) setEditingId(null); }}>
                                    <DialogTrigger asChild>
                                        <Button variant="default" className="h-10 px-4 bg-sky-primary hover:bg-sky-dark text-white rounded-xl shadow-sm gap-2 font-bold" onClick={() => openEdit(service)}>
                                            <Edit className="w-4 h-4" /> Edit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-0 rounded-[2rem] bg-white shadow-2xl">
                                        <DialogHeader className="p-8 pb-4">
                                            <DialogTitle className="text-2xl font-black text-dark-blue flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-sky-light/20 flex items-center justify-center text-sky-primary"><Sparkles className="w-5 h-5" /></div>
                                                Refine Service Details
                                            </DialogTitle>
                                        </DialogHeader>

                                        <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden px-8 pb-8">
                                            <TabsList className="grid grid-cols-3 w-full bg-muted/50 p-1.5 rounded-2xl mb-8">
                                                <TabsTrigger value="basic" className="rounded-xl font-bold py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-sky-primary">Basic Info</TabsTrigger>
                                                <TabsTrigger value="pricing" className="rounded-xl font-bold py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-sky-primary">Pricing & Sample</TabsTrigger>
                                                <TabsTrigger value="content" className="rounded-xl font-bold py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-sky-primary">Work Details</TabsTrigger>
                                            </TabsList>

                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                                <TabsContent value="basic" className="space-y-6 mt-0">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                        <div className="md:col-span-1">
                                                            <Label className="uppercase text-[10px] font-black text-muted-foreground tracking-widest ml-1">Icon (Emoji)</Label>
                                                            <div className="mt-2 flex items-center gap-4">
                                                                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl shadow-inner border border-border/40">
                                                                    {editForm.icon || "📋"}
                                                                </div>
                                                                <Input className="h-12 rounded-xl text-center text-xl" value={editForm.icon || ""} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} maxLength={2} />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <Label className="uppercase text-[10px] font-black text-muted-foreground tracking-widest ml-1">Service Title</Label>
                                                            <Input className="mt-2 h-12 rounded-xl font-bold text-dark-blue px-4 bg-muted/20" value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="e.g. Architectural Planning" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="uppercase text-[10px] font-black text-muted-foreground tracking-widest ml-1">Service Slug (URL)</Label>
                                                        <Input className="h-12 rounded-xl font-mono text-xs bg-muted/20 border-dashed" value={editForm.slug || ""} readOnly disabled />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="uppercase text-[10px] font-black text-muted-foreground tracking-widest ml-1">Short Description</Label>
                                                        <Textarea rows={4} className="rounded-2xl bg-muted/20 p-4 resize-none leading-relaxed" value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Describe the core value proposition of this service..." />
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="pricing" className="space-y-8 mt-0">
                                                    <div className="grid grid-cols-2 gap-6 bg-sky-50/50 p-6 rounded-[2rem] border border-sky-100">
                                                        <div className="space-y-2">
                                                            <Label className="uppercase text-[10px] font-black text-sky-primary tracking-widest ml-1">Regular Price (₹)</Label>
                                                            <div className="relative">
                                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-primary/40" />
                                                                <Input className="h-14 pl-10 rounded-2xl border-sky-200 bg-white font-black text-lg shadow-inner-white" placeholder="e.g. 9999" value={editForm.originalPrice || ""} onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="uppercase text-[10px] font-black text-red-500 tracking-widest ml-1">Offer Price (₹)</Label>
                                                            <div className="relative">
                                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                                                                <Input className="h-14 pl-10 rounded-2xl border-red-100 bg-white font-black text-lg text-red-600 shadow-inner-white" placeholder="e.g. 4999" value={editForm.price || ""} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between px-1">
                                                            <Label className="uppercase text-[10px] font-black text-muted-foreground tracking-widest">Display Image (Cover)</Label>
                                                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/40 cursor-help" />
                                                        </div>
                                                        <div className="group relative">
                                                            {editForm.sampleImageUrl ? (
                                                                <div className="relative w-full h-48 rounded-[2rem] overflow-hidden border-2 border-dashed border-sky-200 bg-muted/20">
                                                                    <img src={editForm.sampleImageUrl} alt="Sample" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <Button variant="destructive" size="sm" className="rounded-full h-10 px-4 font-bold shadow-xl" onClick={() => setEditForm({ ...editForm, sampleImageUrl: "" })}>
                                                                            <X className="w-4 h-4 mr-2" /> Remove Image
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted-foreground/20 rounded-[2rem] cursor-pointer hover:bg-sky-50/50 hover:border-sky-300 transition-all group overflow-hidden bg-muted/5">
                                                                    {uploading ? (
                                                                        <div className="flex flex-col items-center gap-3">
                                                                            <Loader2 className="w-10 h-10 animate-spin text-sky-primary" />
                                                                            <p className="text-xs font-black text-sky-primary uppercase tracking-widest animate-pulse">Uploading Artifact...</p>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <div className="w-16 h-16 rounded-3xl bg-white shadow-md flex items-center justify-center text-sky-primary/30 group-hover:text-sky-primary group-hover:scale-110 transition-all mb-4">
                                                                                <Upload className="w-8 h-8" />
                                                                            </div>
                                                                            <p className="text-sm font-black text-dark-blue">Drop sample image here</p>
                                                                            <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">Supports: JPG, PNG, WEBP (Max 5MB)</p>
                                                                        </>
                                                                    )}
                                                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleSampleUpload} disabled={uploading} />
                                                                </label>
                                                            )}
                                                        </div>

                                                        {/* Document Upload Area */}
                                                        <div className="flex items-center justify-between px-1 pt-4">
                                                            <Label className="uppercase text-[10px] font-black text-muted-foreground tracking-widest">Downloadable Sample File (PDF/Docs)</Label>
                                                        </div>
                                                        <div className="group relative">
                                                            {editForm.sampleDocumentUrl ? (
                                                                <div className="relative w-full h-32 rounded-[2rem] flex flex-col items-center justify-center border-2 border-green-200 bg-green-50 shadow-inner">
                                                                    <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                                                                    <span className="text-sm font-bold text-green-700">Document Uploaded Successfully</span>
                                                                    <a href={editForm.sampleDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-green-600 underline mt-2 hover:text-green-800">View Current File</a>
                                                                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem]">
                                                                        <Button variant="destructive" size="sm" className="rounded-full h-10 px-6 font-bold shadow-xl" onClick={() => setEditForm({ ...editForm, sampleDocumentUrl: "" })}>
                                                                            <X className="w-4 h-4 mr-2" /> Remove File
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/20 rounded-[2rem] cursor-pointer hover:bg-sky-50/50 hover:border-sky-300 transition-all group overflow-hidden bg-muted/5">
                                                                    {uploadingDoc ? (
                                                                        <div className="flex flex-col items-center gap-3">
                                                                            <Loader2 className="w-8 h-8 animate-spin text-sky-primary" />
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-sky-primary/30 group-hover:text-sky-primary group-hover:scale-110 transition-all mb-3">
                                                                                <Upload className="w-6 h-6" />
                                                                            </div>
                                                                            <p className="text-xs font-black text-dark-blue uppercase tracking-widest">Upload Sample PDF/DWG</p>
                                                                        </>
                                                                    )}
                                                                    <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.dwg,.zip,.jpg,.jpeg,.png" className="hidden" onChange={handleDocumentUpload} disabled={uploadingDoc} />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="content" className="space-y-6 mt-0">
                                                    <div className="space-y-4">
                                                        <div className="p-4 rounded-2xl bg-muted/10 border border-border/40">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                <Label className="uppercase text-[10px] font-black text-navy-primary tracking-widest">Inclusions (One per line)</Label>
                                                            </div>
                                                            <Textarea rows={4} className="bg-white rounded-xl resize-none text-sm leading-relaxed border-border/40 focus:ring-sky-primary/20" placeholder="e.g.&#10;Detailed 3D Modeling&#10;Vastu Analysis Report&#10;Material Board" value={(editForm.inclusions || []).join("\n")} onChange={(e) => setEditForm({ ...editForm, inclusions: e.target.value.split("\n").filter(Boolean) })} />
                                                        </div>

                                                        <div className="p-4 rounded-2xl bg-muted/10 border border-border/40">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <ArrowUp className="w-4 h-4 text-sky-primary rotate-45" />
                                                                <Label className="uppercase text-[10px] font-black text-navy-primary tracking-widest">Workflow Process (One per line)</Label>
                                                            </div>
                                                            <Textarea rows={4} className="bg-white rounded-xl resize-none text-sm leading-relaxed border-border/40 focus:ring-sky-primary/20" placeholder="e.g.&#10;Discovery Call&#10;Concept Sketching&#10;Technical Detailing" value={(editForm.processSteps || []).join("\n")} onChange={(e) => setEditForm({ ...editForm, processSteps: e.target.value.split("\n").filter(Boolean) })} />
                                                        </div>

                                                        <div className="p-4 rounded-2xl bg-muted/10 border border-border/40">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Package className="w-4 h-4 text-indigo-500" />
                                                                <Label className="uppercase text-[10px] font-black text-navy-primary tracking-widest">Final Deliverables (One per line)</Label>
                                                            </div>
                                                            <Textarea rows={4} className="bg-white rounded-xl resize-none text-sm leading-relaxed border-border/40 focus:ring-sky-primary/20" placeholder="e.g.&#10;Blueprints (PDF & DWG)&#10;Printable 3D Renders&#10;BOQ Sheet" value={(editForm.deliverables || []).join("\n")} onChange={(e) => setEditForm({ ...editForm, deliverables: e.target.value.split("\n").filter(Boolean) })} />
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                            </div>

                                            <div className="pt-6 grid grid-cols-2 gap-4">
                                                <Button variant="ghost" className="h-14 rounded-2xl font-bold text-muted-foreground" onClick={() => setEditingId(null)}>Cancel</Button>
                                                <Button className="h-14 rounded-2xl sky-gradient text-white font-black text-lg shadow-xl shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-1 transition-all" disabled={saving} onClick={() => updateService(service.id, editForm)}>
                                                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                                                    Apply System Updates
                                                </Button>
                                            </div>
                                        </Tabs>
                                    </DialogContent>
                                </Dialog>

                                <Button variant="ghost" size="icon" className="h-10 w-10 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl" onClick={() => deleteService(service.id)}>
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {services.length === 0 && (
                <div className="text-center py-20 bg-muted/10 rounded-[2rem] border-2 border-dashed border-muted">
                    <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center text-muted-foreground mx-auto mb-6">
                        <Package className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-dark-blue">No Services Configured</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2">Initialize your portfolio by clicking &quot;Create New Service&quot; above.</p>
                </div>
            )}
        </div>
    );
}
