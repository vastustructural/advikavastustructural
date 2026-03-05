"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface GoogleReview {
    id: string;
    name: string;
    role?: string;
    company?: string;
    location?: string;
    content: string;
    rating: number;
    order: number;
    isVisible: boolean;
    photoUrl?: string;
    googleReviewUrl?: string;
}

const emptyForm: Partial<GoogleReview> = {
    name: "",
    role: "",
    location: "",
    content: "",
    rating: 5,
    photoUrl: "",
    googleReviewUrl: "",
    isVisible: true,
};

function StarSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(n)}
                    className="focus:outline-none"
                >
                    <Star className={`w-6 h-6 transition-colors ${(hovered || value) >= n ? "fill-[#FBBC04] text-[#FBBC04]" : "text-gray-300"}`} />
                </button>
            ))}
            <span className="ml-2 text-sm text-slate-500 mt-0.5">{value}.0</span>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

export default function AdminGoogleReviewsPage() {
    const [reviews, setReviews] = useState<GoogleReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<GoogleReview>>(emptyForm);
    const [isNewDialog, setIsNewDialog] = useState(false);
    const [newForm, setNewForm] = useState<Partial<GoogleReview>>(emptyForm);

    useEffect(() => { fetchReviews(); }, []);

    async function fetchReviews() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/testimonials");
            setReviews(await res.json());
        } catch { toast.error("Failed to load reviews"); }
        setLoading(false);
    }

    async function addReview() {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/testimonials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newForm, order: reviews.length }),
            });
            if (res.ok) {
                toast.success("Google review added!");
                setIsNewDialog(false);
                setNewForm(emptyForm);
                await fetchReviews();
            } else toast.error("Failed to add review");
        } catch { toast.error("An error occurred"); }
        setSaving(false);
    }

    async function updateReview(id: string, data: Partial<GoogleReview>) {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/testimonials/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) { toast.success("Review updated!"); await fetchReviews(); setEditingId(null); }
            else toast.error("Failed to update review");
        } catch { toast.error("An error occurred"); }
        setSaving(false);
    }

    async function deleteReview(id: string) {
        if (!confirm("Delete this Google review? This cannot be undone.")) return;
        await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
        toast.success("Review deleted");
        await fetchReviews();
    }

    const avgRating = reviews.filter(r => r.isVisible).length > 0
        ? (reviews.filter(r => r.isVisible).reduce((s, r) => s + r.rating, 0) / reviews.filter(r => r.isVisible).length).toFixed(1)
        : "—";

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-7 h-7 animate-spin text-navy-primary" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <GoogleIcon />
                        <h1 className="text-2xl font-bold text-navy-dark">Google Reviews</h1>
                    </div>
                    <p className="text-muted-foreground text-sm">Manage Google reviews displayed on your website. Add, edit, or hide reviews to build client trust.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-[#FBBC04] text-[#FBBC04]" />
                            <span className="font-bold text-navy-dark text-lg">{avgRating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{reviews.filter(r => r.isVisible).length} reviews</p>
                    </div>
                    <Dialog open={isNewDialog} onOpenChange={setIsNewDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-navy-primary hover:bg-navy-dark text-white gap-2">
                                <Plus className="w-4 h-4" /> Add Review
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2"><GoogleIcon /> Add Google Review</DialogTitle>
                            </DialogHeader>
                            <ReviewForm form={newForm} setForm={setNewForm} onSave={addReview} saving={saving} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Tip Banner
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
                <GoogleIcon />
                <p><strong>Pro tip:</strong> Copy real reviews from your Google Business Profile page and paste them here. Add the reviewer&apos;s Google profile link for added credibility. Showing 4★ and 5★ reviews builds the most trust with potential clients.</p>
            </div> */}

            {/* Review Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((r) => (
                    <Card key={r.id} className={`border shadow-sm transition-opacity ${!r.isVisible ? "opacity-50" : ""}`}>
                        <CardContent className="p-5">
                            {/* Google Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                                        {r.photoUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={r.photoUrl} alt={r.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-slate-500">{r.name?.charAt(0)?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-navy-dark text-sm leading-tight">{r.name}</p>
                                        <p className="text-xs text-slate-400">{r.location || r.role || "Google Review"}</p>
                                    </div>
                                </div>
                                <GoogleIcon />
                            </div>

                            {/* Stars */}
                            <div className="flex gap-0.5 mb-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? "fill-[#FBBC04] text-[#FBBC04]" : "text-gray-200"}`} />
                                ))}
                            </div>

                            <p className="text-sm text-slate-600 line-clamp-3 italic">&ldquo;{r.content}&rdquo;</p>

                            {r.googleReviewUrl && (
                                <a href={r.googleReviewUrl} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-2">
                                    <ExternalLink className="w-3 h-3" /> View on Google
                                </a>
                            )}

                            {/* Actions */}
                            <div className="flex gap-1 mt-3 pt-3 border-t">
                                <Button variant="ghost" size="icon" onClick={() => updateReview(r.id, { isVisible: !r.isVisible })}>
                                    {r.isVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                                </Button>
                                <Dialog open={editingId === r.id} onOpenChange={(open) => { if (!open) setEditingId(null); }}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => { setEditForm(r); setEditingId(r.id); }}>
                                            <Edit className="w-4 h-4 text-slate-500" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                                        <DialogHeader><DialogTitle className="flex items-center gap-2"><GoogleIcon /> Edit Google Review</DialogTitle></DialogHeader>
                                        <ReviewForm form={editForm} setForm={setEditForm} onSave={() => updateReview(r.id, editForm)} saving={saving} />
                                    </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50 ml-auto" onClick={() => deleteReview(r.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {reviews.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <div className="text-4xl mb-3">⭐</div>
                    <p className="font-semibold text-slate-700 mb-1">No reviews yet</p>
                    <p className="text-sm text-slate-400 mb-4">Add your first Google review to display on the website.</p>
                    <Button className="bg-navy-primary text-white" onClick={() => setIsNewDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add First Review
                    </Button>
                </div>
            )}
        </div>
    );
}

function ReviewForm({ form, setForm, onSave, saving }: {
    form: Partial<GoogleReview>;
    setForm: (f: Partial<GoogleReview>) => void;
    onSave: () => void;
    saving: boolean;
}) {
    const upd = (key: keyof GoogleReview, val: string | number | boolean) => setForm({ ...form, [key]: val });

    return (
        <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Reviewer Name *</Label>
                    <Input value={form.name || ""} onChange={(e) => upd("name", e.target.value)} placeholder="Rahul Sharma" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Location / Role</Label>
                    <Input value={form.location || form.role || ""} onChange={(e) => upd("location", e.target.value)} placeholder="Mumbai, Maharashtra" />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Star Rating *</Label>
                <StarSelector value={form.rating ?? 5} onChange={(n) => upd("rating", n)} />
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Review Text *</Label>
                <Textarea
                    rows={4}
                    value={form.content || ""}
                    onChange={(e) => upd("content", e.target.value)}
                    placeholder="Paste the review text from Google here..."
                    className="resize-none"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Google Review URL <span className="text-slate-400 font-normal">(optional)</span></Label>
                <Input value={form.googleReviewUrl || ""} onChange={(e) => upd("googleReviewUrl", e.target.value)} placeholder="https://g.page/r/..." />
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Reviewer Photo URL <span className="text-slate-400 font-normal">(optional — from Google profile)</span></Label>
                <Input value={form.photoUrl || ""} onChange={(e) => upd("photoUrl", e.target.value)} placeholder="https://lh3.googleusercontent.com/..." />
            </div>

            <Button onClick={onSave} disabled={saving || !form.name || !form.content} className="w-full bg-navy-primary hover:bg-navy-dark text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Review
            </Button>
        </div>
    );
}
