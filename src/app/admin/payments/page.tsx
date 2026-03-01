"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    IndianRupee, Loader2, Search, TrendingUp, Clock, XCircle,
    CheckCircle2, CreditCard, User, Phone, Mail, Hash,
} from "lucide-react";

interface Payment {
    id: string;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    amount: number;
    currency: string;
    status: string;
    userName: string | null;
    userEmail: string | null;
    userPhone: string | null;
    requirements?: string | null;
    planId: string | null;
    productId: string | null;
    referrer: { name: string; phone: string; referralCode: string } | null;
    createdAt: string;
    updatedAt: string;
}

interface PaymentStats {
    totalRevenue: number;
    totalPaid: number;
    totalPending: number;
    totalFailed: number;
    total: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PAID: { label: "Paid", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    PENDING: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    FAILED: { label: "Failed", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
    CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600 border-gray-200", icon: XCircle },
};

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        fetchPayments();
    }, [statusFilter]);

    async function fetchPayments() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.set("status", statusFilter);
            if (search) params.set("search", search);
            const res = await fetch(`/api/admin/payments?${params.toString()}`);
            const data = await res.json();
            setPayments(data.payments || []);
            setStats(data.stats || null);
        } catch {
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => fetchPayments(), 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString("en-IN")}`;
    };

    if (loading && payments.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payments & Orders</h1>
                <p className="text-muted-foreground text-sm">Track all transactions and revenue</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalPaid}</p>
                            <p className="text-sm text-gray-500">Successful</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalPending}</p>
                            <p className="text-sm text-gray-500">Pending</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalFailed}</p>
                            <p className="text-sm text-gray-500">Failed</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, email, phone, or order ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Payments List */}
            <div className="space-y-3">
                {payments.map((payment) => {
                    const config = statusConfig[payment.status] || statusConfig.PENDING;
                    const StatusIcon = config.icon;
                    return (
                        <Card key={payment.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Left — User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={`${config.color} border text-xs font-semibold`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {config.label}
                                            </Badge>
                                            <span className="text-xs text-gray-400">
                                                {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric", month: "short", year: "numeric",
                                                    hour: "2-digit", minute: "2-digit",
                                                })}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                            {payment.userName && (
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="font-medium">{payment.userName}</span>
                                                </div>
                                            )}
                                            {payment.userEmail && (
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="truncate">{payment.userEmail}</span>
                                                </div>
                                            )}
                                            {payment.userPhone && (
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{payment.userPhone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Hash className="w-3.5 h-3.5" />
                                                <span className="text-xs font-mono truncate">{payment.razorpayOrderId}</span>
                                            </div>
                                        </div>

                                        {payment.referrer && (
                                            <div className="mt-2 text-xs text-gray-400">
                                                Referred by: <span className="font-medium text-gray-600">{payment.referrer.name}</span> ({payment.referrer.referralCode})
                                            </div>
                                        )}

                                        {payment.requirements && (
                                            <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 text-sm text-gray-700">
                                                <span className="font-semibold text-blue-900/80 text-[10px] uppercase tracking-wider mb-1 block">Project Requirements</span>
                                                <p className="whitespace-pre-wrap leading-relaxed">{payment.requirements}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right — Amount */}
                                    <div className="flex items-center gap-3 md:text-right">
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <IndianRupee className="w-4 h-4 text-gray-600" />
                                                <span className="text-xl font-bold text-gray-900">
                                                    {payment.amount.toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {payment.planId ? "Plan" : payment.productId ? "Product" : "Payment"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {payments.length === 0 && !loading && (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Payments Found</h3>
                        <p className="text-sm text-gray-400">
                            {search || statusFilter !== "ALL"
                                ? "Try adjusting your search or filters"
                                : "Payments will appear here once customers make purchases"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
