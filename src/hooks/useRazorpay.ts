"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayError {
    description: string;
    [key: string]: unknown;
}

interface RazorpayOptions {
    amount: string | number;
    planId?: string;
    productId?: string;
    name?: string;
    email?: string;
    phone?: string;
    requirements?: string;
    description?: string;
    onSuccess?: (response: RazorpayResponse) => void;
    onError?: (error: RazorpayError | Error) => void;
}

export const useRazorpay = () => {
    const [loading, setLoading] = useState(false);

    const loadRazorpayScript = useCallback(() => {
        return new Promise((resolve) => {
            if (typeof window !== "undefined" && (window as unknown as { Razorpay: unknown }).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.id = "razorpay-sdk";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }, []);

    const checkout = async ({
        amount,
        planId,
        productId,
        name,
        email,
        phone,
        requirements,
        description = "Payment for architectural services",
        onSuccess,
        onError,
    }: RazorpayOptions) => {
        if (loading) return;
        setLoading(true);

        const toastId = toast.loading("Preparing secure checkout...");

        try {
            if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
                console.error("Razorpay Key ID is not configured in environment variables.");
                toast.error("Payment system configuration error. Please contact support.", { id: toastId });
                setLoading(false);
                return;
            }

            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error("Cloud delivery failed. Please check your connection.", { id: toastId });
                setLoading(false);
                return;
            }

            // Clean price string
            const cleanAmount = typeof amount === "string"
                ? amount.replace(/[^0-9.]/g, "")
                : amount.toString();

            if (!cleanAmount || isNaN(parseFloat(cleanAmount)) || parseFloat(cleanAmount) <= 0) {
                toast.error("Invalid amount encountered.", { id: toastId });
                setLoading(false);
                return;
            }

            // Get referral code if exists
            const referralCode = localStorage.getItem("referralCode") || Cookies.get("referralCode");

            // Create Order on Backend
            const orderRes = await fetch("/api/payments/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: cleanAmount,
                    planId,
                    productId,
                    userEmail: email,
                    userName: name,
                    userPhone: phone,
                    requirements,
                    referralCode: referralCode || undefined,
                }),
            });

            if (!orderRes.ok) {
                const errorData = await orderRes.json().catch(() => ({ error: "Unknown error" }));
                console.error("Order Creation Failed:", errorData);
                throw new Error(errorData.error || "Failed to initialize secure transaction.");
            }

            const orderData = await orderRes.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Advika Vastu",
                description,
                image: "/favicon.ico", // Optional: link to your logo
                order_id: orderData.id,
                handler: async function (response: RazorpayResponse) {
                    toast.loading("Verifying payment...", { id: toastId });

                    try {
                        const verifyRes = await fetch("/api/payments/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            toast.success("Payment Received! Thank you for choosing Advika Vastu.", { id: toastId, duration: 5000 });
                            if (onSuccess) onSuccess(response);
                        } else {
                            throw new Error(verifyData.error || "Payment verification failed.");
                        }
                    } catch (err: unknown) {
                        const message = err instanceof Error ? err.message : "Payment verification failed";
                        toast.error(message, { id: toastId });
                        if (onError) onError(err as Error);
                    }
                },
                prefill: {
                    name: name || "",
                    email: email || "",
                    contact: phone || "",
                },
                notes: {
                    planId: planId || "",
                    productId: productId || "",
                },
                theme: {
                    color: "#1B2A4A",
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        toast.dismiss(toastId);
                    }
                }
            };

            const RazorpayClass = (window as unknown as { Razorpay: any }).Razorpay;
            const rzp = new RazorpayClass(options);
            rzp.on("payment.failed", function (response: { error: RazorpayError }) {
                toast.error(response.error.description, { id: toastId });
                if (onError) onError(response.error);
            });
            rzp.open();
        } catch (error: unknown) {
            console.error("Payment Gateway Error:", error);
            const message = error instanceof Error ? error.message : "An unexpected error occurred.";
            toast.error(message, { id: toastId });
            if (onError) onError(error as Error);
            setLoading(false);
        }
    };

    return { checkout, loading };
};
