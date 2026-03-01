import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { adminDb } from "@/lib/firebase-admin";

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
                    const adminUsersRef = adminDb.collection("AdminUser");
                    const snapshot = await adminUsersRef
                        .where("email", "==", email)
                        .where("role", "==", "super_admin")
                        .limit(1)
                        .get();

                    if (snapshot.empty) return null;

                    const adminDoc = snapshot.docs[0];
                    const admin = adminDoc.data();

                    const isValid = await bcrypt.compare(password, admin.password);
                    if (!isValid) return null;

                    return {
                        id: adminDoc.id,
                        name: admin.name,
                        email: admin.email,
                        role: admin.role,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
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
