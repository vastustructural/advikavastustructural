"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Upload, ImageIcon, X, MapPin, Layers, LayoutGrid, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
    id: string; name: string; slug: string; description: string; price: string;
    originalPrice?: string; imageUrl?: string;
    category: string; area: string; order: number; isVisible: boolean;
    floors?: number; direction?: string; width?: number; depth?: number;
    bhk?: string; vastu?: string; code?: string; downloadLink?: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Product> | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchProducts(); }, []);

    async function fetchProducts() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/products");
            if (res.ok) {
                setProducts(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd() {
        setSaving(true);
        try {
            await fetch("/api/admin/products", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "New Design Plan", price: "2999", category: "Floor Plan", code: "NEW-001", order: products.length }),
            });
            await fetchProducts();
            toast.success("New product draft created");
        } catch (error) {
            toast.error("Failed to add product");
        } finally {
            setSaving(false);
        }
    }

    async function handleSave() {
        if (!editForm || !editForm.id) return;
        setSaving(true);
        try {
            await fetch(`/api/admin/products/${editForm.id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm),
            });
            await fetchProducts();
            setIsSheetOpen(false);
            setEditForm(null);
            toast.success("Product updated successfully");
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    }

    async function deleteProduct(id: string) {
        if (!confirm("Are you sure you want to delete this design permanently?")) return;
        try {
            await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
            toast.success("Design deleted");
            await fetchProducts();
        } catch (error) {
            toast.error("Failed to delete design");
        }
    }

    async function toggleVisibility(id: string, current: boolean) {
        try {
            await fetch(`/api/admin/products/${id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isVisible: !current }),
            });
            await fetchProducts();
            toast.success(current ? "Design hidden from shop" : "Design is now live in shop");
        } catch (error) {
            toast.error("Failed to toggle visibility");
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !editForm) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "products");

            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");
            const { url } = await res.json();
            setEditForm({ ...editForm, imageUrl: url });
            toast.success("Image uploaded successfully");
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-navy-primary">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium animate-pulse">Loading Architecture Portfolio...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-[2rem] border border-navy-primary/5 shadow-sm">
                <div>
                    <Badge className="bg-gold-accent/10 text-gold-accent hover:bg-gold-accent/20 border-0 mb-2 font-bold px-3 py-1">Store Inventory</Badge>
                    <h1 className="text-3xl font-black text-navy-dark tracking-tight">Design & Plans</h1>
                    <p className="text-navy-primary/60 mt-1 font-medium text-sm">Manage your architectural portfolio, layouts, and pre-designed products.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-primary/40" />
                        <Input
                            placeholder="Search code or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 rounded-xl border-navy-primary/10 bg-cream-bg/30 h-11"
                        />
                    </div>
                    <Button onClick={handleAdd} disabled={saving} className="gold-gradient text-navy-primary font-bold rounded-xl h-11 px-6 shadow-md hover:shadow-lg transition-all shrink-0">
                        <Plus className="w-4 h-4 mr-2" /> New Design
                    </Button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <Card key={product.id} className={`group border border-navy-primary/5 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-white ${!product.isVisible ? "grayscale-[0.5] opacity-70" : ""}`}>
                        {/* Image Header */}
                        <div className="relative h-48 bg-cream-bg/50 overflow-hidden">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-navy-primary/20">
                                    <LayoutGrid className="w-12 h-12 mb-2 opacity-50 stroke-1" />
                                    <span className="text-xs font-bold uppercase tracking-widest">No Preview</span>
                                </div>
                            )}

                            <div className="absolute top-3 left-3 flex gap-2">
                                <Badge className="bg-white/90 text-navy-dark backdrop-blur-sm border-0 shadow-sm font-black text-[10px] tracking-widest uppercase">{product.category}</Badge>
                                {!product.isVisible && <Badge variant="destructive" className="border-0 shadow-sm text-[10px] uppercase">Hidden</Badge>}
                            </div>

                            {/* Action Overlay */}
                            <div className="absolute inset-0 bg-navy-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                <Button size="icon" variant="secondary" className="rounded-full w-10 h-10 shadow-lg hover:scale-110 transition-transform bg-white text-navy-dark"
                                    onClick={() => { setEditForm(product); setIsSheetOpen(true); }}>
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant={product.isVisible ? "secondary" : "default"} className={`rounded-full w-10 h-10 shadow-lg hover:scale-110 transition-transform ${product.isVisible ? "bg-white text-navy-dark" : "bg-gold-accent text-navy-primary"}`}
                                    onClick={() => toggleVisibility(product.id, product.isVisible)}>
                                    {product.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                <Button size="icon" variant="destructive" className="rounded-full w-10 h-10 shadow-lg hover:scale-110 transition-transform bg-red-500 text-white"
                                    onClick={() => deleteProduct(product.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Content Body */}
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-navy-primary/5 text-navy-primary/60 border border-navy-primary/10">
                                    {product.code || "NO-CODE"}
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                                        <span className="text-xs line-through text-navy-primary/30">₹{product.originalPrice}</span>
                                    )}
                                    <span className="font-black text-navy-dark text-lg">₹{product.price}</span>
                                </div>
                            </div>

                            <h3 className="font-bold text-navy-dark text-base leading-tight mb-3 line-clamp-1 group-hover:text-gold-accent transition-colors">{product.name}</h3>

                            <div className="flex items-center justify-between text-xs font-semibold text-navy-primary/50 pt-3 border-t border-navy-primary/5">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {product.area || "N/A sqft"}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5" />
                                    {product.floors ? `${product.floors} Floors` : "1 Floor"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="bg-white rounded-[2rem] border border-navy-primary/5 p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-cream-bg rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3">
                        <LayoutGrid className="w-8 h-8 text-gold-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-dark mb-2">No designs found</h3>
                    <p className="text-navy-primary/60 max-w-sm mx-auto">You haven't added any products matching this search. Create a new architectural plan to get started.</p>
                </div>
            )}

            {/* Advanced Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-xl md:max-w-2xl bg-white p-0 border-l border-navy-primary/10 shadow-3xl text-navy-dark custom-scrollbar overflow-y-auto">
                    {editForm && (
                        <div className="flex flex-col h-full">
                            <div className="p-6 md:p-8 bg-cream-bg/30 border-b border-navy-primary/5 shrink-0">
                                <SheetHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shadow-md">
                                            <Edit2 className="w-5 h-5 text-navy-primary" />
                                        </div>
                                        <div>
                                            <SheetTitle className="text-2xl font-black text-navy-dark">Edit Product Details</SheetTitle>
                                            <SheetDescription className="font-medium">Maintain comprehensive specs for architectural plans.</SheetDescription>
                                        </div>
                                    </div>
                                </SheetHeader>
                            </div>

                            <div className="flex-1 p-6 md:p-8">
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="w-full h-12 bg-navy-primary/5 p-1 rounded-xl mb-8">
                                        <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-navy-dark font-bold text-sm">Essentials</TabsTrigger>
                                        <TabsTrigger value="specs" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-navy-dark font-bold text-sm">Technical Specs</TabsTrigger>
                                        <TabsTrigger value="media" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-navy-dark font-bold text-sm">Media & Media</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider">Product Title (Name)</Label>
                                                <Input className="h-12 border-navy-primary/20 rounded-xl mt-1.5 focus-visible:ring-gold-accent font-semibold text-lg" value={editForm.name || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider">Design Code</Label>
                                                    <Input placeholder="e.g. AD-123" className="h-11 border-navy-primary/20 rounded-xl mt-1.5 font-mono" value={editForm.code || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, code: e.target.value } : null)} />
                                                </div>
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider">Category</Label>
                                                    <Input className="h-11 border-navy-primary/20 rounded-xl mt-1.5 font-medium" value={editForm.category || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, category: e.target.value } : null)} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider flex items-center justify-between">
                                                        Selling Price (₹) <Badge className="text-[9px] bg-green-500/10 text-green-600 border-0 h-4 px-1 rounded-sm">Final</Badge>
                                                    </Label>
                                                    <Input className="h-11 border-navy-primary/20 rounded-xl mt-1.5 font-bold" value={editForm.price || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, price: e.target.value } : null)} />
                                                </div>
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider flex items-center justify-between">
                                                        Original Price (₹) <Badge className="text-[9px] bg-red-500/10 text-red-600 border-0 h-4 px-1 rounded-sm">Strikethrough</Badge>
                                                    </Label>
                                                    <Input className="h-11 border-navy-primary/20 rounded-xl mt-1.5" value={editForm.originalPrice || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, originalPrice: e.target.value } : null)} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider">Short Description</Label>
                                                <Textarea rows={4} className="border-navy-primary/20 rounded-xl mt-1.5 resize-none leading-relaxed" value={editForm.description || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, description: e.target.value } : null)} />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="specs" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                            <div className="col-span-2">
                                                <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider">Overall Area (e.g. 1500 sqft)</Label>
                                                <Input className="h-11 border-navy-primary/20 rounded-xl mt-1.5 font-medium" value={editForm.area || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, area: e.target.value } : null)} />
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider">Plot Width (Feet)</Label>
                                                <Input type="number" className="h-11 border-navy-primary/20 rounded-xl mt-1.5" value={editForm.width || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, width: parseFloat(e.target.value) || 0 } : null)} />
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider">Plot Depth (Feet)</Label>
                                                <Input type="number" className="h-11 border-navy-primary/20 rounded-xl mt-1.5" value={editForm.depth || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, depth: parseFloat(e.target.value) || 0 } : null)} />
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider">Facing Direction</Label>
                                                <Input placeholder="East / North-East" className="h-11 border-navy-primary/20 rounded-xl mt-1.5" value={editForm.direction || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, direction: e.target.value } : null)} />
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider">Unit Configuration</Label>
                                                <Input placeholder="3BHK / Duplex" className="h-11 border-navy-primary/20 rounded-xl mt-1.5" value={editForm.bhk || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, bhk: e.target.value } : null)} />
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider">Number of Floors</Label>
                                                <Input type="number" className="h-11 border-navy-primary/20 rounded-xl mt-1.5" value={editForm.floors || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, floors: parseInt(e.target.value) || 0 } : null)} />
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider">Vastu Status</Label>
                                                <Input placeholder="Yes / No / Doesn't Matter" className="h-11 border-navy-primary/20 rounded-xl mt-1.5" value={editForm.vastu || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, vastu: e.target.value } : null)} />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="media" className="focus-visible:outline-none focus-visible:ring-0">
                                        <div className="bg-cream-bg/30 p-6 rounded-[2rem] border border-navy-primary/5 text-center mb-6">
                                            <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider block mb-4 text-left">Digital Product Delivery Link</Label>
                                            <Input placeholder="https://drive.google.com/... or https://dropbox.com/..." className="h-12 border-navy-primary/20 rounded-xl mt-1.5 focus-visible:ring-gold-accent font-medium text-sm text-left mb-2" value={editForm.downloadLink || ""} onChange={(e) => setEditForm(prev => prev ? { ...prev, downloadLink: e.target.value } : null)} />
                                            <p className="text-xs text-navy-primary/50 text-left">This completely secure link will be provided to the customer immediately post-purchase.</p>
                                        </div>

                                        <div className="bg-cream-bg/30 p-6 rounded-[2rem] border border-navy-primary/5 text-center">
                                            <Label className="text-xs uppercase font-bold text-navy-primary/50 tracking-wider block mb-4 text-left">Primary Showcase Image</Label>

                                            {editForm.imageUrl ? (
                                                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden border-2 border-white shadow-md group">
                                                    <img src={editForm.imageUrl} alt="Product" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-navy-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <Button variant="destructive" className="rounded-xl shadow-xl font-bold px-6" onClick={() => setEditForm(prev => prev ? { ...prev, imageUrl: "" } : null)}>
                                                            <X className="w-4 h-4 mr-2" /> Remove Image
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center w-full aspect-[4/3] sm:aspect-[16/9] border-2 border-dashed border-navy-primary/20 rounded-2xl cursor-pointer hover:bg-white hover:border-gold-accent transition-all group">
                                                    {uploading ? (
                                                        <div className="flex flex-col items-center">
                                                            <Loader2 className="w-10 h-10 animate-spin text-gold-accent mb-4" />
                                                            <p className="font-bold text-navy-primary">Uploading to Storage...</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center p-6 text-navy-primary/40 group-hover:text-gold-accent transition-colors">
                                                            <div className="w-16 h-16 rounded-full bg-navy-primary/5 flex items-center justify-center mb-4 group-hover:bg-gold-accent/10 transition-colors">
                                                                <Upload className="w-8 h-8" />
                                                            </div>
                                                            <p className="font-bold text-navy-dark text-lg mb-1">Click to browse or drag image</p>
                                                            <p className="text-xs font-medium">JPEG, PNG, WebP format (Max 5MB)</p>
                                                            <p className="text-[10px] mt-2 bg-cream-bg px-2 py-0.5 rounded text-navy-primary/50 font-mono">Recommended size: 1200x800px</p>
                                                        </div>
                                                    )}
                                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                                </label>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="p-6 md:p-8 border-t border-navy-primary/5 bg-white shrink-0">
                                <Button className="w-full h-14 gold-gradient text-navy-primary font-black text-lg rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all" disabled={saving || uploading} onClick={handleSave}>
                                    {saving ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <CheckCircle2 className="w-6 h-6 mr-2" />}
                                    {saving ? "Deploying Changes..." : "Save Product Configuration"}
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div >
    );
}
