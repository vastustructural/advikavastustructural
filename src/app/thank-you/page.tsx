"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight, MessageCircle, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Invoice } from "@/components/Invoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function ThankYouContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Retrieve the Razorpay order ID passed via query params
        const id = searchParams.get("order_id");
        if (id) {
            setOrderId(id);
            // Fetch the rest of the order details securely from our API
            fetch(`/api/payments/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setOrderData(data);
                    }
                })
                .catch(err => console.error("Failed to fetch order details", err));
        } else {
            // Optional: If no order ID, redirect home after a short delay
            const timer = setTimeout(() => router.push("/"), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    const handleDownloadInvoice = async () => {
        if (!invoiceRef.current || !orderData) return;
        setIsDownloading(true);
        const toastId = toast.loading("Generating your secured tax invoice...");

        try {
            // Wait a brief moment to ensure all styles and fonts have rendered in the hidden div
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
            pdf.save(`Advika-Vastu-Invoice-${orderId}.pdf`);

            toast.success("Invoice downloaded successfully!", { id: toastId });
        } catch (error) {
            console.error("PDF generation failed", error);
            toast.error("Failed to generate invoice. Please contact support.", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Hidden Invoice Component for PDF conversion */}
            {orderData && (
                <Invoice
                    ref={invoiceRef}
                    orderId={orderData.razorpayOrderId}
                    amount={orderData.amount}
                    currency={orderData.currency}
                    date={orderData.createdAt}
                    customerName={orderData.userName}
                    customerEmail={orderData.userEmail}
                    customerPhone={orderData.userPhone}
                />
            )}

            {/* Background Decorations */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gold-accent blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-sky-primary blur-[100px] mix-blend-multiply" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-navy-primary/5 p-8 md:p-12 relative z-10 text-center"
            >
                {/* Success Icon Animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm"
                >
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>

                <h1 className="text-3xl md:text-5xl font-black text-navy-dark tracking-tight mb-4">
                    Payment Successful!
                </h1>

                <p className="text-lg text-muted-foreground font-medium mb-8 leading-relaxed">
                    Thank you for choosing Advika Vastu-Structural. Your order has been securely processed and is now being prepared for delivery.
                </p>

                {orderId && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-navy-primary/[0.03] border border-navy-primary/10 rounded-2xl p-6 mb-10 text-left flex flex-col gap-4"
                    >
                        <div className="flex items-start gap-4">
                            <Package className="w-6 h-6 text-gold-accent shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase font-black text-navy-primary/40 tracking-widest mb-1">Transaction Reference</p>
                                <p className="font-mono text-navy-dark font-bold text-sm truncate">{orderId}</p>
                            </div>
                            {orderData && (
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] uppercase font-black text-navy-primary/40 tracking-widest mb-1">Amount Paid</p>
                                    <p className="font-black text-navy-dark text-sm">
                                        ₹{orderData.amount.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            )}
                        </div>

                        {orderData && (
                            <div className="pt-4 border-t border-navy-primary/10 flex flex-col gap-3">
                                {orderData.downloadLink && (
                                    <Button
                                        asChild
                                        className="w-full h-12 bg-navy-dark hover:bg-navy-primary text-white font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                                    >
                                        <a href={orderData.downloadLink} target="_blank" rel="noopener noreferrer">
                                            <Download className="w-4 h-4 mr-2" />
                                            Access Digital Files
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    onClick={handleDownloadInvoice}
                                    disabled={isDownloading}
                                    variant="outline"
                                    className="w-full h-12 bg-white border-navy-primary/20 text-navy-primary hover:bg-navy-primary/5 font-bold rounded-xl"
                                >
                                    {isDownloading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4 mr-2" />
                                    )}
                                    {isDownloading ? "Generating PDF..." : "Download Official Invoice"}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}

                <div className="space-y-6">
                    <div className="border-b border-navy-primary/10 pb-6 mb-2 text-left">
                        <h3 className="font-bold text-navy-dark mb-2 text-lg">Next Steps:</h3>
                        <p className="text-sm text-navy-dark/70 font-medium leading-relaxed">
                            Our team has been notified. We will reach out to you directly via WhatsApp on the phone number you provided within 24 hours to deliver your purchased plans or initiate your service consultation.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild className="w-full sm:w-auto h-14 rounded-2xl gold-gradient text-navy-primary font-bold px-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                            <Link href="/">
                                Return Home <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full sm:w-auto h-14 rounded-2xl border-navy-primary/10 text-navy-dark font-bold px-8 shadow-sm hover:bg-cream-bg transition-all hover:-translate-y-0.5">
                            <Link href="/shop">
                                Continue Shopping
                            </Link>
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Need Help Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 text-center relative z-10"
            >
                <p className="text-sm text-navy-dark/60 font-medium flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gold-accent" />
                    Haven't heard from us? <Link href="/contact" className="text-navy-primary font-bold hover:underline">Contact Support</Link>
                </p>
            </motion.div>
        </div>
    );
}

export default function ThankYouPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-cream-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-primary"></div>
            </div>
        }>
            <ThankYouContent />
        </Suspense>
    );
}
