import { cache } from "react";
import { adminDb } from "./firebase-admin";
import { HomePageData, DEFAULT_HOME_DATA, NavLink, SocialLink } from "./types/home";

// ─── Error Handler ─────────────────────────────────────
/** Wraps a Firestore query with error handling, returning a fallback on failure. */
async function safeQuery<T>(queryFn: () => Promise<T>, fallback: T, label: string): Promise<T> {
    try {
        return await queryFn();
    } catch (error) {
        console.error(`[Data] Failed to fetch ${label}:`, error instanceof Error ? error.message : error);
        return fallback;
    }
}

// Helper to map snapshot to array of items with id
function mapQuerySnapshot(snapshot: FirebaseFirestore.QuerySnapshot) {
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        // Prevent Next.js Error: "Only plain objects can be passed to Client Components"
        // Convert any Firebase Timestamps to standard serializable string primitives.
        const serializedData = Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = value && typeof value === 'object' && '_seconds' in value ? new Date(value.toDate()).toISOString() : value;
            return acc;
        }, {} as Record<string, any>);
        return { id: doc.id, ...serializedData } as any;
    });
}

// ─── Services ──────────────────────────────────────────
export async function getServices() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("Service").orderBy("order").get();
            return mapQuerySnapshot(snapshot).filter((item: any) => item.isVisible !== false);
        },
        [],
        "services"
    );
}

export async function getAllServices() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("Service").orderBy("order").get();
            return mapQuerySnapshot(snapshot);
        },
        [],
        "all services"
    );
}

// ─── Plans ─────────────────────────────────────────────
export async function getPlans() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("Plan").orderBy("order").get();
            return mapQuerySnapshot(snapshot).filter((item: any) => item.isVisible !== false);
        },
        [],
        "plans"
    );
}

export async function getAllPlans() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("Plan").orderBy("order").get();
            return mapQuerySnapshot(snapshot);
        },
        [],
        "all plans"
    );
}

// ─── Products ──────────────────────────────────────────
export async function getProducts() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("Product").orderBy("order").get();
            return mapQuerySnapshot(snapshot).filter((item: any) => item.isVisible !== false);
        },
        [],
        "products"
    );
}

export async function getAllProducts() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("Product").orderBy("order").get();
            return mapQuerySnapshot(snapshot);
        },
        [],
        "all products"
    );
}

export async function getProductById(id: string) {
    return safeQuery(
        async () => {
            const doc = await adminDb.collection("Product").doc(id).get();
            if (!doc.exists) return null;

            const data = doc.data() as any;
            const serializedData = Object.entries(data).reduce((acc, [key, value]) => {
                acc[key] = value && typeof value === 'object' && '_seconds' in value ? new Date((value as any).toDate()).toISOString() : value;
                return acc;
            }, {} as Record<string, any>);

            return { id: doc.id, ...serializedData } as any;
        },
        null,
        `product: ${id}`
    );
}

// ─── Gallery ───────────────────────────────────────────
export async function getGalleryCategories() {
    return safeQuery(
        async () => {
            const categoriesSnapshot = await adminDb.collection("GalleryCategory").orderBy("order").get();
            const itemsSnapshot = await adminDb.collection("GalleryItem").orderBy("order").get();
            const items = mapQuerySnapshot(itemsSnapshot).filter((item: any) => item.isVisible !== false);

            return categoriesSnapshot.docs.map(doc => {
                const category = { id: doc.id, ...doc.data() } as any;
                return {
                    ...category,
                    items: items.filter((item: any) => item.categoryId === doc.id)
                };
            });
        },
        [],
        "gallery categories"
    );
}

export async function getGalleryItems() {
    return safeQuery(
        async () => {
            const itemsSnapshot = await adminDb.collection("GalleryItem").orderBy("order").get();
            const categoriesSnapshot = await adminDb.collection("GalleryCategory").get();
            const categories = mapQuerySnapshot(categoriesSnapshot);

            const categoryMap = new Map(categories.map((c: any) => [c.id, c]));
            return itemsSnapshot.docs
                .map(doc => {
                    const item = { id: doc.id, ...doc.data() } as any;
                    item.category = categoryMap.get(item.categoryId);
                    return item;
                })
                .filter(item => item.isVisible !== false);
        },
        [],
        "gallery items"
    );
}

export async function getAllGalleryItems() {
    return safeQuery(
        async () => {
            const itemsSnapshot = await adminDb.collection("GalleryItem").orderBy("order").get();
            const categoriesSnapshot = await adminDb.collection("GalleryCategory").get();
            const categories = mapQuerySnapshot(categoriesSnapshot);

            const categoryMap = new Map(categories.map((c: any) => [c.id, c]));
            return itemsSnapshot.docs.map(doc => {
                const item = { id: doc.id, ...doc.data() } as any;
                item.category = categoryMap.get(item.categoryId);
                return item;
            });
        },
        [],
        "all gallery items"
    );
}

// ─── Testimonials ──────────────────────────────────────
export async function getTestimonials() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("Testimonial").orderBy("order").get();
            return mapQuerySnapshot(snapshot).filter((item: any) => item.isVisible !== false);
        },
        [],
        "testimonials"
    );
}

export async function getAllTestimonials() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("Testimonial").orderBy("order").get();
            return mapQuerySnapshot(snapshot);
        },
        [],
        "all testimonials"
    );
}

// ─── Legal Pages ───────────────────────────────────────
export async function getLegalPage(slug: string): Promise<{ title: string; content: string; slug: string } | null> {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("LegalPage").where("slug", "==", slug).limit(1).get();
            if (snapshot.empty) return null;
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
        },
        null,
        `legal page: ${slug}`
    );
}

export async function getAllLegalPages(): Promise<Array<{ id: string; title: string; slug: string; updatedAt: Date }>> {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("LegalPage").orderBy("updatedAt", "desc").get();
            return mapQuerySnapshot(snapshot) as any;
        },
        [],
        "all legal pages"
    );
}

// ─── Contact Submissions ──────────────────────────────
export async function getContactSubmissions() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("ContactSubmission").orderBy("createdAt", "desc").get();
            return mapQuerySnapshot(snapshot);
        },
        [],
        "contact submissions"
    );
}

// ─── Global Settings ──────────────────────────────────
export async function getSettings(): Promise<Record<string, any>> {
    try {
        const snapshot = await adminDb.collection("GlobalSettings").get();
        const settings: Record<string, any> = {};
        for (const doc of snapshot.docs) {
            settings[doc.id] = doc.data().value;
            // Or if key was a field: settings[doc.data().key] = doc.data().value;
            // Assuming the doc ID is the key
            if (doc.data().key) settings[doc.data().key] = doc.data().value;
        }
        return settings;
    } catch (error) {
        console.error("[Data] Failed to fetch settings:", error instanceof Error ? error.message : error);
        return {};
    }
}

export async function getSetting(key: string) {
    try {
        // Assume key could be the doc id or a field
        const docRef = await adminDb.collection("GlobalSettings").doc(key).get();
        if (docRef.exists) return docRef.data()?.value ?? null;

        const snapshot = await adminDb.collection("GlobalSettings").where("key", "==", key).limit(1).get();
        if (!snapshot.empty) return snapshot.docs[0].data().value;

        return null;
    } catch (error) {
        console.error(`[Data] Failed to fetch setting "${key}":`, error instanceof Error ? error.message : error);
        return null;
    }
}

// ─── Calculators ──────────────────────────────────────
export async function getCalculators() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("Calculator").orderBy("order").get();
            return mapQuerySnapshot(snapshot).filter((item: any) => item.isVisible !== false);
        },
        [],
        "calculators"
    );
}

export async function getAllCalculators() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("Calculator").orderBy("order").get();
            return mapQuerySnapshot(snapshot);
        },
        [],
        "all calculators"
    );
}

// ─── CTA Sections ─────────────────────────────────────
export async function getCtaSections() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("CtaSection").orderBy("order").get();
            return mapQuerySnapshot(snapshot).filter((item: any) => item.isVisible !== false);
        },
        [],
        "CTA sections"
    );
}

export async function getAllCtaSections() {
    return safeQuery(
        async () => {
            const snapshot = await adminDb.collection("CtaSection").orderBy("order").get();
            return mapQuerySnapshot(snapshot);
        },
        [],
        "all CTA sections"
    );
}

// ─── Chat Sessions ────────────────────────────────────
export async function getChatSessions(limit: number = 50) {
    return safeQuery(
        async () => {
            const sessionsSnap = await adminDb.collection("ChatSession").orderBy("createdAt", "desc").limit(limit).get();
            const sessions = mapQuerySnapshot(sessionsSnap);

            // For each session we'd fetch messages, this might be intensive so we can use a simpler approach or a subcollection
            for (let session of sessions as any[]) {
                const messagesSnap = await adminDb.collection(`ChatSession/${session.id}/messages`).orderBy("createdAt", "asc").get();
                if (!messagesSnap.empty) {
                    session.messages = mapQuerySnapshot(messagesSnap);
                } else {
                    // Try top level ChatMessage collection just in case
                    const altSnap = await adminDb.collection("ChatMessage").where("sessionId", "==", session.id).get();
                    session.messages = mapQuerySnapshot(altSnap).sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
                }
            }
            return sessions;
        },
        [],
        "chat sessions"
    );
}

export async function getChatSessionById(id: string) {
    return safeQuery(
        async () => {
            const doc = await adminDb.collection("ChatSession").doc(id).get();
            if (!doc.exists) return null;

            const session = { id: doc.id, ...doc.data() } as any;
            const messagesSnap = await adminDb.collection("ChatMessage").where("sessionId", "==", id).get();
            session.messages = mapQuerySnapshot(messagesSnap).sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

            return session;
        },
        null,
        `chat session: ${id}`
    );
}

// ─── Dashboard Stats ──────────────────────────────────
export async function getDashboardStats() {
    const defaultStats = { services: 0, plans: 0, products: 0, gallery: 0, testimonials: 0, contacts: 0, chatSessions: 0, payments: 0 };
    try {
        const collections = ["Service", "Plan", "Product", "GalleryItem", "Testimonial", "ContactSubmission", "ChatSession", "Payment"];
        const counts = await Promise.all(collections.map(async (col) => {
            // Note: count() is available in newer firebase-admin sdks
            const countSnap = await adminDb.collection(col).count().get();
            return countSnap.data().count;
        }));

        return {
            services: counts[0] || 0,
            plans: counts[1] || 0,
            products: counts[2] || 0,
            gallery: counts[3] || 0,
            testimonials: counts[4] || 0,
            contacts: counts[5] || 0,
            chatSessions: counts[6] || 0,
            payments: counts[7] || 0,
        };
    } catch (error) {
        console.error("[Data] Failed to fetch dashboard stats:", error instanceof Error ? error.message : error);
        return defaultStats;
    }
}

// ─── Home Page ────────────────────────────────────────
export const getHomePageData = cache(async (): Promise<HomePageData> => {
    try {
        const docRef = await adminDb.collection("HomePage").doc("singleton").get();
        if (!docRef.exists) {
            return { ...DEFAULT_HOME_DATA, id: "singleton" } as HomePageData;
        }

        const data = docRef.data();
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
