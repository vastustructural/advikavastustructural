import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    providers: [
        Credentials({
            name: "Admin Login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                if (!email || !password) return null;

                try {
                    const { data: admin, error } = await supabaseAdmin
                        .from("AdminUser")
                        .select("*")
                        .eq("email", email)
                        .single();

                    if (error || !admin) return null;

                    const isValid = await bcrypt.compare(password, admin.password);
                    if (!isValid) return null;

                    return {
                        id: admin.id,
                        name: admin.name,
                        email: admin.email,
                        role: admin.role,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.email = user.email;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
});
