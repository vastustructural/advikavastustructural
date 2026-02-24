import { cache } from "react";
import { supabaseAdmin } from "./supabase";
import { HomePageData, DEFAULT_HOME_DATA, NavLink, SocialLink } from "./types/home";

// ─── Error Handler ─────────────────────────────────────
/** Wraps a Supabase query with error handling, returning a fallback on failure. */
async function safeQuery<T>(queryFn: () => Promise<{ data: T | null; error: any }>, fallback: T, label: string): Promise<T> {
    try {
        const { data, error } = await queryFn();
        if (error) throw error;
        return (data as T) || fallback;
    } catch (error) {
        console.error(`[Data] Failed to fetch ${label}:`, error instanceof Error ? error.message : error);
        return fallback;
    }
}

// ─── Services ──────────────────────────────────────────
/** Fetches all visible services ordered by display position. */
export async function getServices() {
    return safeQuery(
        async () => await supabaseAdmin.from("Service").select("*").eq("isVisible", true).order("order"),
        [],
        "services"
    );
}

/** Fetches all services (including hidden) for admin panel. */
export async function getAllServices() {
    return safeQuery(
        async () => await supabaseAdmin.from("Service").select("*").order("order"),
        [],
        "all services"
    );
}

// ─── Plans ─────────────────────────────────────────────
/** Fetches all visible plans ordered by display position. */
export async function getPlans() {
    return safeQuery(
        async () => await supabaseAdmin.from("Plan").select("*").eq("isVisible", true).order("order"),
        [],
        "plans"
    );
}

/** Fetches all plans (including hidden) for admin panel. */
export async function getAllPlans() {
    return safeQuery(
        async () => await supabaseAdmin.from("Plan").select("*").order("order"),
        [],
        "all plans"
    );
}

// ─── Products ──────────────────────────────────────────
/** Fetches all visible products ordered by display position. */
export async function getProducts() {
    return safeQuery(
        async () => await supabaseAdmin.from("Product").select("*").eq("isVisible", true).order("order"),
        [],
        "products"
    );
}

/** Fetches all products (including hidden) for admin panel. */
export async function getAllProducts() {
    return safeQuery(
        async () => await supabaseAdmin.from("Product").select("*").order("order"),
        [],
        "all products"
    );
}

// ─── Gallery ───────────────────────────────────────────
/** Fetches gallery categories with their visible items. */
export async function getGalleryCategories() {
    return safeQuery(
        async () => await supabaseAdmin
            .from("GalleryCategory")
            .select("*, items:GalleryItem(*)")
            .eq("GalleryItem.isVisible", true)
            .order("order")
            .order("order", { foreignTable: "GalleryItem" }),
        [],
        "gallery categories"
    );
}

/** Fetches all visible gallery items with their category. */
export async function getGalleryItems() {
    return safeQuery(
        async () => await supabaseAdmin
            .from("GalleryItem")
            .select("*, category:GalleryCategory(*)")
            .eq("isVisible", true)
            .order("order"),
        [],
        "gallery items"
    );
}

/** Fetches all gallery items (including hidden) for admin panel. */
export async function getAllGalleryItems() {
    return safeQuery(
        async () => await supabaseAdmin
            .from("GalleryItem")
            .select("*, category:GalleryCategory(*)")
            .order("order"),
        [],
        "all gallery items"
    );
}

// ─── Testimonials ──────────────────────────────────────
/** Fetches all visible testimonials ordered by display position. */
export async function getTestimonials() {
    return safeQuery(
        async () => await supabaseAdmin.from("Testimonial").select("*").eq("isVisible", true).order("order"),
        [],
        "testimonials"
    );
}

/** Fetches all testimonials (including hidden) for admin panel. */
export async function getAllTestimonials() {
    return safeQuery(
        async () => await supabaseAdmin.from("Testimonial").select("*").order("order"),
        [],
        "all testimonials"
    );
}

// ─── Legal Pages ───────────────────────────────────────
/** Fetches a single legal page by its slug. */
export async function getLegalPage(slug: string): Promise<{ title: string; content: string; slug: string } | null> {
    return safeQuery(
        async () => await supabaseAdmin.from("LegalPage").select("*").eq("slug", slug).single(),
        null,
        `legal page: ${slug}`
    );
}

/** Fetches all legal pages for admin panel. */
export async function getAllLegalPages(): Promise<Array<{ id: string; title: string; slug: string; updatedAt: Date }>> {
    return safeQuery(
        async () => await supabaseAdmin.from("LegalPage").select("*").order("updatedAt", { ascending: false }),
        [],
        "all legal pages"
    );
}

// ─── Contact Submissions ──────────────────────────────
/** Fetches all contact submissions, newest first. */
export async function getContactSubmissions() {
    return safeQuery(
        async () => await supabaseAdmin.from("ContactSubmission").select("*").order("createdAt", { ascending: false }),
        [],
        "contact submissions"
    );
}

// ─── Global Settings ──────────────────────────────────
/** Fetches all global settings as a key-value record. */
export async function getSettings(): Promise<Record<string, any>> {
    try {
        const { data, error } = await supabaseAdmin.from("GlobalSettings").select("*");
        if (error) throw error;

        const settings: Record<string, any> = {};
        for (const row of data || []) {
            settings[row.key] = row.value;
        }
        return settings;
    } catch (error) {
        console.error("[Data] Failed to fetch settings:", error instanceof Error ? error.message : error);
        return {};
    }
}

/** Fetches a single setting value by key. */
export async function getSetting(key: string) {
    try {
        const { data, error } = await supabaseAdmin.from("GlobalSettings").select("value").eq("key", key).single();
        if (error) throw error;
        return data?.value ?? null;
    } catch (error) {
        console.error(`[Data] Failed to fetch setting "${key}":`, error instanceof Error ? error.message : error);
        return null;
    }
}

// ─── Calculators ──────────────────────────────────────
/** Fetches all visible calculators ordered by display position. */
export async function getCalculators() {
    return safeQuery(
        async () => await supabaseAdmin.from("Calculator").select("*").eq("isVisible", true).order("order"),
        [],
        "calculators"
    );
}

/** Fetches all calculators (including hidden) for admin panel. */
export async function getAllCalculators() {
    return safeQuery(
        async () => await supabaseAdmin.from("Calculator").select("*").order("order"),
        [],
        "all calculators"
    );
}

// ─── CTA Sections ─────────────────────────────────────
/** Fetches all visible CTA sections ordered by display position. */
export async function getCtaSections() {
    return safeQuery(
        async () => await supabaseAdmin.from("CtaSection").select("*").eq("isVisible", true).order("order"),
        [],
        "CTA sections"
    );
}

/** Fetches all CTA sections (including hidden) for admin panel. */
export async function getAllCtaSections() {
    return safeQuery(
        async () => await supabaseAdmin.from("CtaSection").select("*").order("order"),
        [],
        "all CTA sections"
    );
}

// ─── Chat Sessions ────────────────────────────────────
/** Fetches recent chat sessions with messages, limited by count. */
export async function getChatSessions(limit: number = 50) {
    return safeQuery(
        async () => await supabaseAdmin
            .from("ChatSession")
            .select("*, messages:ChatMessage(*)")
            .order("createdAt", { ascending: false })
            .limit(limit)
            .order("createdAt", { foreignTable: "ChatMessage", ascending: true }),
        [],
        "chat sessions"
    );
}

/** Fetches a single chat session by ID with all its messages. */
export async function getChatSessionById(id: string) {
    return safeQuery(
        async () => await supabaseAdmin
            .from("ChatSession")
            .select("*, messages:ChatMessage(*)")
            .eq("id", id)
            .order("createdAt", { foreignTable: "ChatMessage", ascending: true })
            .single(),
        null,
        `chat session: ${id}`
    );
}

// ─── Dashboard Stats ──────────────────────────────────
/** Fetches aggregate counts for the admin dashboard. */
export async function getDashboardStats() {
    const defaultStats = { services: 0, plans: 0, products: 0, gallery: 0, testimonials: 0, contacts: 0, chatSessions: 0, payments: 0 };
    try {
        const [services, plans, products, gallery, testimonials, contacts, chatSessions, payments] =
            await Promise.all([
                supabaseAdmin.from("Service").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("Plan").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("Product").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("GalleryItem").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("Testimonial").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("ContactSubmission").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("ChatSession").select("*", { count: "exact", head: true }),
                supabaseAdmin.from("Payment").select("*", { count: "exact", head: true }),
            ]);

        return {
            services: services.count || 0,
            plans: plans.count || 0,
            products: products.count || 0,
            gallery: gallery.count || 0,
            testimonials: testimonials.count || 0,
            contacts: contacts.count || 0,
            chatSessions: chatSessions.count || 0,
            payments: payments.count || 0,
        };
    } catch (error) {
        console.error("[Data] Failed to fetch dashboard stats:", error instanceof Error ? error.message : error);
        return defaultStats;
    }
}

// ─── Home Page ────────────────────────────────────────
/** Fetches the singleton home page data, merging with defaults for missing fields. */
export const getHomePageData = cache(async (): Promise<HomePageData> => {
    try {
        const { data, error } = await supabaseAdmin
            .from("HomePage")
            .select("*")
            .eq("id", "singleton")
            .single();

        if (error && error.code !== "PGRST116") { // Ignore "no rows returned" error
            throw error;
        }

        return {
            ...DEFAULT_HOME_DATA,
            ...data,
            id: "singleton",
            socialLinks: (data?.socialLinks as SocialLink[]) || DEFAULT_HOME_DATA.socialLinks,
            quickLinks: (data?.quickLinks as NavLink[]) || DEFAULT_HOME_DATA.quickLinks,
            legalLinks: (data?.legalLinks as NavLink[]) || DEFAULT_HOME_DATA.legalLinks,
        } as HomePageData;
    } catch (error) {
        console.error("[Data] Failed to fetch home page data:", error instanceof Error ? error.message : error);
        return { ...DEFAULT_HOME_DATA, id: "singleton" } as HomePageData;
    }
});
