"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Copy, Check, Share2, Users } from "lucide-react";
import { toast } from "sonner";

interface ReferrerData {
    name: string;
    phone: string;
    referralCode: string;
}

export default function ReferAndEarn({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [referrer, setReferrer] = useState<{ referrer: ReferrerData; referralLink: string } | null>(null);
    const [copied, setCopied] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/referrals/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone }),
            });

            const data = await res.json();

            if (res.ok) {
                setReferrer(data);
                toast.success("Referral link generated!");
            } else {
                toast.error(data.error || "Failed to generate referral link");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function copyToClipboard() {
        if (!referrer) return;
        navigator.clipboard.writeText(referrer.referralLink);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    }

    function shareViaWhatsapp() {
        if (!referrer) return;
        const text = `Join Advika Vastu-Structural using my link and get best designs: ${referrer.referralLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-2xl overflow-hidden p-0">
                <div className="sky-gradient p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users size={120} />
                    </div>
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-3xl font-bold mb-2">Refer & Earn 10% Commission</DialogTitle>
                        <DialogDescription className="text-white/80 text-lg">
                            {referrer
                                ? "Your unique referral link is ready!"
                                : "Earn 10% commission on the total project value closed through your referral. It's that simple!"}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-6">
                    {!referrer ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ref-name" className="text-dark-blue/70 font-medium">Your Name</Label>
                                <Input
                                    id="ref-name"
                                    placeholder="Enter your name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="border-gray-200 focus:border-sky-primary h-12 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ref-phone" className="text-dark-blue/70 font-medium">Mobile Number</Label>
                                <Input
                                    id="ref-phone"
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="border-gray-200 focus:border-sky-primary h-12 rounded-xl"
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full sky-gradient text-white h-12 rounded-xl font-bold shadow-lg shadow-sky-primary/20 hover:scale-[1.02] transition-transform">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate My Referral Link"}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 bg-sky-light/10 border border-sky-light/20 rounded-2xl space-y-3">
                                <p className="text-sm font-semibold text-sky-primary uppercase tracking-wider">Your Referral Link</p>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={referrer.referralLink}
                                        className="bg-white border-gray-100 font-mono text-sm h-11"
                                    />
                                    <Button size="icon" onClick={copyToClipboard} variant="outline" className="shrink-0 border-gray-200 h-11 w-11 shadow-sm">
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button onClick={shareViaWhatsapp} variant="outline" className="h-14 rounded-2xl flex flex-col gap-1 border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all font-bold">
                                    <Share2 className="w-5 h-5" />
                                    <span className="text-[10px] uppercase font-bold tracking-tight">Share on WhatsApp</span>
                                </Button>
                                <Button onClick={copyToClipboard} variant="outline" className="h-14 rounded-2xl flex flex-col gap-1 border-gray-200 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-primary transition-all font-bold">
                                    <Copy className="w-5 h-5" />
                                    <span className="text-[10px] uppercase font-bold tracking-tight">Copy to Clipboard</span>
                                </Button>
                            </div>

                            <p className="text-center text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg leading-relaxed">
                                Share this link with your contacts. When they complete a purchase using your link, we&apos;ll notify you and send your 10% reward!
                            </p>

                            <Button onClick={() => setReferrer(null)} variant="ghost" className="w-full text-xs text-muted-foreground hover:text-sky-primary">
                                Register with another number
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
