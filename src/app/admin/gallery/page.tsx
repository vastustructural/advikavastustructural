"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface GalleryItem {
    id: string; title: string; description: string; imageUrl: string;
    categoryId: string; category: { id: string; name: string }; order: number; isVisible: boolean;
}
interface Category { id: string; name: string; }

export default function AdminGalleryPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<GalleryItem>>({});
    const [uploading, setUploading] = useState(false);
    const [addingCategory, setAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [savingCat, setSavingCat] = useState(false);

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "gallery");
            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error((await res.json()).error || "Upload failed");
            const { url } = await res.json();
            setEditForm(prev => ({ ...prev, imageUrl: url }));
            toast.success("Image uploaded successfully");
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    }

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/gallery");
            const data = await res.json();
            setItems(data.items || []);
            setCategories(data.categories || []);
        } catch (error) {
            console.error("Fetch data error:", error);
            toast.error("Failed to load gallery data");
        } finally {
            setLoading(false);
        }
    }

    async function addCategory() {
        if (!newCategoryName.trim()) {
            toast.error("Category name is required");
            return;
        }
        setSavingCat(true);
        try {
            const res = await fetch("/api/admin/gallery/categories", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategoryName.trim() }),
            });
            if (!res.ok) throw new Error("Failed to add category");
            toast.success("Category added successfully");
            setNewCategoryName("");
            setAddingCategory(false);
            await fetchData();
        } catch (err: any) {
            toast.error(err.message || "Failed to add category");
        } finally {
            setSavingCat(false);
        }
    }

    async function addItem() {
        if (categories.length === 0) {
            toast.error("No categories available. Please add categories first.");
            return;
        }
        setSaving(true);
        try {
            const catId = activeCategory !== "all" ? activeCategory : categories[0]?.id;
            const res = await fetch("/api/admin/gallery", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "New Item", categoryId: catId, order: items.length }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to add item");
            }

            toast.success("New gallery item created");
            await fetchData();
        } catch (err: any) {
            toast.error(err.message || "Failed to add item");
        } finally {
            setSaving(false);
        }
    }

    async function updateItem(id: string, data: Partial<GalleryItem>) {
        setSaving(true);
        const { category, ...cleanData } = data as any;
        await fetch(`/api/admin/gallery/${id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cleanData),
        });
        await fetchData(); setSaving(false); setEditingId(null);
    }

    async function deleteItem(id: string) {
        if (!confirm("Delete this item?")) return;
        await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
        await fetchData();
    }

    const filtered = activeCategory === "all" ? items : items.filter((i) => i.categoryId === activeCategory);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-sky-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-dark-blue">Gallery Manager</h1>
                    <p className="text-muted-foreground text-sm">Manage your project gallery and portfolio images.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={addingCategory} onOpenChange={setAddingCategory}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Add Category</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Category</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <Label>Category Name</Label>
                                    <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g. Interior Design" />
                                </div>
                                <Button className="w-full sky-gradient text-white" disabled={savingCat} onClick={addCategory}>
                                    {savingCat ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Category
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={addItem} disabled={saving} className="sky-gradient text-white gap-2"><Plus className="w-4 h-4" /> Add Item</Button>
                </div>
            </div>

            <div className="flex gap-2 flex-wrap">
                <Button variant={activeCategory === "all" ? "default" : "outline"} size="sm"
                    className={activeCategory === "all" ? "sky-gradient text-white" : ""} onClick={() => setActiveCategory("all")}>All</Button>
                {categories.map((cat) => (
                    <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "outline"} size="sm"
                        className={activeCategory === cat.id ? "sky-gradient text-white" : ""} onClick={() => setActiveCategory(cat.id)}>{cat.name}</Button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((item) => (
                    <Card key={item.id} className={`border-0 shadow-sm overflow-hidden ${!item.isVisible ? "opacity-60" : ""}`}>
                        <div className="h-40 bg-gradient-to-br from-sky-light/20 to-sky-primary/10 flex items-center justify-center">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <span className="text-4xl">🖼️</span>}
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-dark-blue">{item.title || "Untitled"}</h3>
                            <p className="text-xs text-muted-foreground">{item.category?.name}</p>
                            <div className="flex gap-1 mt-2">
                                <Button variant="ghost" size="icon" onClick={() => updateItem(item.id, { isVisible: !item.isVisible })}>
                                    {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </Button>
                                <Dialog open={editingId === item.id} onOpenChange={(open) => { if (!open) setEditingId(null); }}>
                                    <DialogTrigger asChild><Button variant="ghost" size="icon" onClick={() => { setEditForm(item); setEditingId(item.id); }}><Edit className="w-4 h-4" /></Button></DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader><DialogTitle>Edit Gallery Item</DialogTitle></DialogHeader>
                                        <div className="space-y-4 mt-4">
                                            <div><Label>Title</Label><Input value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                                            <div>
                                                <Label>Gallery Image</Label>
                                                <div className="mt-2">
                                                    {editForm.imageUrl ? (
                                                        <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-gray-50">
                                                            <img src={editForm.imageUrl} alt="Gallery" className="w-full h-full object-cover" />
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                className="absolute top-2 right-2 h-7 w-7 rounded-full"
                                                                onClick={() => setEditForm({ ...editForm, imageUrl: "" })}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                            {uploading ? (
                                                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                                            ) : (
                                                                <>
                                                                    <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                                                                    <span className="text-sm text-muted-foreground">Upload gallery image</span>
                                                                </>
                                                            )}
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                            <div><Label>Description</Label><Textarea rows={2} value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></div>
                                            <div>
                                                <Label>Category</Label>
                                                <select className="w-full border rounded-md px-3 py-2 text-sm" value={editForm.categoryId || ""} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}>
                                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <Button className="w-full sky-gradient text-white" disabled={saving} onClick={() => updateItem(item.id, editForm)}>Save</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No gallery items in this category.</p>}
        </div>
    );
}
