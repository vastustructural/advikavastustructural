"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        const result = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            router.push("/admin");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-blue via-sky-dark to-sky-primary p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-sky-light blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl shadow-black/20">
                <CardContent className="p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl sky-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-primary/30">
                            <span className="text-white font-bold text-2xl">PM</span>
                        </div>
                        <h1 className="text-2xl font-bold text-dark-blue">Admin Panel</h1>
                        <p className="text-muted-foreground text-sm mt-1">Sign in to manage your website</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@vastu.com"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full sky-gradient text-white hover:opacity-90 font-semibold py-6"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 rounded-xl bg-section-gray text-center">
                        <p className="text-xs text-muted-foreground mb-1">Demo Credentials</p>
                        <p className="text-sm font-mono text-dark-blue">admin@vastu.com</p>
                        <p className="text-sm font-mono text-dark-blue">password123</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
