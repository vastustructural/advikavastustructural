import React from "react";

interface InvoiceProps {
    orderId: string;
    amount: number;
    currency: string;
    date: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items?: { description: string; price: number }[];
}

export const Invoice = React.forwardRef<HTMLDivElement, InvoiceProps>(
    ({ orderId, amount, currency, date, customerName, customerEmail, customerPhone, items }, ref) => {
        const formatPrice = (value: number) => {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: currency || "INR",
                maximumFractionDigits: 0,
            }).format(value);
        };

        const formattedDate = new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        return (
            <div
                ref={ref}
                style={{
                    width: "800px",
                    minHeight: "1100px", // Standard A4-ish proportions at High DPI
                    position: "absolute",
                    left: "-9999px",
                    top: "-9999px",
                    backgroundColor: "#ffffff",
                    color: "#1e293b",
                    fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    padding: "48px 64px",
                    boxSizing: "border-box"
                }}
            >
                {/* Brand Strip Top */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: "linear-gradient(90deg, #1B2A4A 0%, #d4af37 100%)" }} />

                {/* Header Sequence */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "48px", borderBottom: "1px solid #e2e8f0", paddingBottom: "32px", paddingTop: "16px" }}>
                    <div>
                        <h1 style={{ fontSize: "36px", fontWeight: 900, color: "#1B2A4A", margin: 0, letterSpacing: "-1px" }}>Advika Vastu</h1>
                        <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "2px", margin: "4px 0 0 0" }}>
                            Architecture & Structural Design
                        </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <h2 style={{ fontSize: "32px", fontWeight: 900, color: "#d4af37", margin: 0, letterSpacing: "1px" }}>TAX INVOICE</h2>
                        <p style={{ fontSize: "14px", fontWeight: 800, color: "#334155", margin: "8px 0 4px 0" }}>INV-{orderId.substring(0, 10).toUpperCase()}</p>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#64748b", margin: 0 }}>Date: {formattedDate}</p>
                    </div>
                </div>

                {/* Customer Info Grid */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "48px" }}>
                    {/* Billed To */}
                    <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "24px", borderRadius: "12px", borderLeft: "4px solid #1B2A4A" }}>
                        <p style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, letterSpacing: "1px", color: "#94a3b8", margin: "0 0 12px 0" }}>Billed To</p>
                        <p style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>{customerName || "Valued Customer"}</p>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#475569", margin: "0" }}>{customerEmail}</p>
                        {customerPhone && <p style={{ fontSize: "14px", fontWeight: 500, color: "#475569", margin: "4px 0 0 0" }}>{customerPhone}</p>}
                    </div>
                    <div style={{ width: "32px" }} /> {/* Spacer */}
                    {/* Payment Info */}
                    <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "24px", borderRadius: "12px", borderRight: "4px solid #dcfce7", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <p style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, letterSpacing: "1px", color: "#94a3b8", margin: "0 0 12px 0" }}>Payment Status</p>
                        <div style={{ backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", padding: "8px 16px", borderRadius: "99px", display: "inline-block" }}>
                            <span style={{ fontSize: "14px", fontWeight: 800, color: "#166534" }}>PAID SECURELY</span>
                        </div>
                        <p style={{ fontSize: "12px", fontWeight: 500, color: "#64748b", margin: "16px 0 0 0" }}>Via Razorpay Gateway</p>
                    </div>
                </div>

                {/* Invoice Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "48px" }}>
                    <thead>
                        <tr>
                            <th style={{ backgroundColor: "#1B2A4A", color: "#ffffff", padding: "16px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", textAlign: "left", borderRadius: "8px 0 0 8px" }}>Item Description</th>
                            <th style={{ backgroundColor: "#1B2A4A", color: "#ffffff", padding: "16px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", textAlign: "right", borderRadius: "0 8px 8px 0" }}>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items && items.length > 0 ? (
                            items.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ padding: "24px 16px", fontSize: "15px", fontWeight: 700, color: "#334155", borderBottom: "1px solid #f1f5f9" }}>{item.description}</td>
                                    <td style={{ padding: "24px 16px", fontSize: "15px", fontWeight: 800, color: "#0f172a", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>{formatPrice(item.price)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td style={{ padding: "32px 16px", fontSize: "16px", fontWeight: 700, color: "#334155", borderBottom: "1px solid #f1f5f9" }}>
                                    Professional Architectural / Digital Service Deliverable
                                    <p style={{ fontSize: "13px", color: "#64748b", fontWeight: 500, margin: "6px 0 0 0" }}>Includes associated design consultations and PDF exports</p>
                                </td>
                                <td style={{ padding: "32px 16px", fontSize: "16px", fontWeight: 900, color: "#0f172a", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>{formatPrice(amount)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Subtotals & Total */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "64px" }}>
                    <div style={{ width: "320px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#64748b" }}>Subtotal</span>
                            <span style={{ fontSize: "15px", fontWeight: 800, color: "#334155" }}>{formatPrice(amount)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#64748b" }}>GST / Taxes</span>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8" }}>INCLUSIVE</span>
                        </div>
                        <div style={{ borderTop: "2px solid #e2e8f0", margin: "16px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px" }}>
                            <span style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>Total Paid</span>
                            <span style={{ fontSize: "24px", fontWeight: 900, color: "#1B2A4A" }}>{formatPrice(amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div style={{ position: "absolute", bottom: "48px", left: "64px", right: "64px", borderTop: "1px solid #e2e8f0", paddingTop: "24px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: "#475569", margin: "0 0 8px 0" }}>Thank you for trusting Advika Vastu & Structural</p>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#94a3b8", margin: 0 }}>This is a computer-generated invoice and does not require a physical signature.</p>
                </div>
            </div>
        );
    }
);

Invoice.displayName = "Invoice";
