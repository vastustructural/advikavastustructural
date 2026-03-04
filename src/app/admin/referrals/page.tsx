"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Users, TrendingUp, DollarSign, Calendar, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReferrerStats {
    id: string;
    name: string;
    phone: string;
    referralCode: string;
    successfulReferrals: number;
    totalRevenue: number;
    createdAt: string;
}

export default function AdminReferralsPage() {
    const [referrers, setReferrers] = useState<ReferrerStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchReferrals();
    }, []);

    async function fetchReferrals() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/referrals");
            if (res.ok) {
                const data = await res.json();
                setReferrers(data);
            } else {
                toast.error("Failed to fetch referrals");
            }
        } catch (error) {
            toast.error("An error occurred while fetching referrals");
        } finally {
            setLoading(false);
        }
    }

    const filteredReferrers = referrers.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.phone.includes(search) ||
        r.referralCode.toLowerCase().includes(search.toLowerCase())
    );

    const totalStats = referrers.reduce((acc, curr) => ({
        referrals: acc.referrals + curr.successfulReferrals,
        revenue: acc.revenue + curr.totalRevenue
    }), { referrals: 0, revenue: 0 });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-dark-blue">Referral Program</h1>
                <p className="text-muted-foreground text-sm">Monitor and manage your referrers and their earnings.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrers</CardTitle>
                        <Users className="w-4 h-4 text-sky-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referrers.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registered promoters</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Successful Conversions</CardTitle>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStats.referrals}</div>
                        <p className="text-xs text-muted-foreground mt-1">Paid purchases via referral links</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Referred Revenue</CardTitle>
                        <DollarSign className="w-4 h-4 text-gold-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalStats.revenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total value from referrals</p>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="border-b bg-muted/20 flex flex-row items-center justify-between gap-4">
                    <CardTitle className="text-lg font-bold">Referrers List</CardTitle>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, phone or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-9"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/30 text-muted-foreground font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Referrer Details</th>
                                    <th className="px-6 py-4 text-center">Referral Code</th>
                                    <th className="px-6 py-4 text-center">Successful Referrals</th>
                                    <th className="px-6 py-4 text-right">Projected Payout</th>
                                    <th className="px-6 py-4 text-right">Revenue Generated</th>
                                    <th className="px-6 py-4 text-right">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredReferrers.map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-dark-blue">{r.name}</div>
                                            <div className="text-xs text-muted-foreground">{r.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-sky-light/10 text-sky-primary px-3 py-1 rounded-full font-mono text-xs font-bold border border-sky-light/20">
                                                {r.referralCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-lg font-bold text-dark-blue">{r.successfulReferrals}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-sky-primary">₹{(r.totalRevenue * 0.10).toLocaleString()}</div>
                                            <div className="text-[10px] text-muted-foreground">@ 10% commission</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-green-600">₹{r.totalRevenue.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">
                                            {format(new Date(r.createdAt), "MMM d, yyyy")}
                                        </td>
                                    </tr>
                                ))}
                                {filteredReferrers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            No referrers found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
