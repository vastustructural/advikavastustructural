import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PublicLayout from "@/components/layout/PublicLayout";
import LittleAduChat from '@/components/LittleAduChat';

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://www.advikavastu.com'),
  title: {
    default: "Advika Vastu-Structural | Architecture, Planning & Vastu Consultancy",
    template: "%s | Advika Vastu-Structural",
  },
  description:
    "Expert Vastu-compliant architectural planning, structural consultancy, and professional engineering services across all of India. Trusted by 500+ clients nationwide.",
  keywords: [
    "vastu",
    "architecture",
    "structural",
    "planning",
    "consultancy",
    "vastu shastra",
    "building design",
    "India",
    "Advika Vastu-Structural",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Advika Vastu Structural",
    title: "Advika Vastu Structural | Architecture, Planning & Vastu Consultancy",
    description:
      "Expert Vastu-compliant architectural planning, structural consultancy, and professional engineering services across all of India.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <PublicLayout>{children}</PublicLayout>
        <LittleAduChat />
      </body>
    </html>
  );
}
