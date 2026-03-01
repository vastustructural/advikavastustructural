import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import path from "path";

// Extract service account credentials
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.error("Firebase credentials not found in environment variables.");
    process.exit(1);
}

// Initialize Firebase Admin
let app: App;
if (!getApps().length) {
    app = initializeApp({
        credential: cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
    });
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

const plans = [
    {
        name: "Essential 2D Floor Plan",
        slug: "essential-2d-floor-plan",
        description: "Perfect for budget-conscious homeowners. Get a professional, scale-accurate 2D layout.",
        price: "1999",
        timeline: "2-3 Days",
        isFeatured: false,
        order: 1,
        isVisible: true,
        features: [
            "1 Design Concept",
            "Furniture Layout Mapping",
            "Standard Column Placement",
            "Door & Window Schedules",
            "1 Free Revision"
        ]
    },
    {
        name: "Premium 3D Elevation",
        slug: "premium-3d-elevation",
        description: "Visualize your dream home exterior before construction begins with photorealistic 3D renders.",
        price: "4999",
        timeline: "5-7 Days",
        isFeatured: false,
        order: 2,
        isVisible: true,
        features: [
            "2 Exterior Concept Options",
            "High-Resolution 3D Renders",
            "Material & Paint Suggestions",
            "Day & Night Angle Views",
            "2 Free Revisions"
        ]
    },
    {
        name: "Complete Arch & Vastu Suite",
        slug: "complete-arch-vastu-suite",
        description: "Our most comprehensive package. Expert architectural planning combined with precise Vastu-Shastra alignment.",
        price: "9999",
        timeline: "10-14 Days",
        isFeatured: true,
        order: 3,
        isVisible: true,
        features: [
            "100% Vastu-Compliant Zoning",
            "2D Floor Plans & 3D Elevations",
            "Basic Structural Drawings",
            "Plumbing & Electrical Layouts",
            "Dedicated Project Manager",
            "Unlimited Minor Revisions"
        ]
    },
    {
        name: "Commercial & Mega Projects",
        slug: "commercial-mega-projects",
        description: "Tailored architectural and structural consultancy for apartments, offices, and commercial complexes.",
        price: "Contact Us",
        timeline: "Custom Timeline",
        isFeatured: false,
        order: 4,
        isVisible: true,
        features: [
            "Multi-Story Structural Analysis",
            "Commercial Vastu Planning",
            "Detailed HVAC & MEP Drawings",
            "Government Approval Support",
            "Site Supervision Visits"
        ]
    }
];

async function seedPlans() {
    console.log("Seeding architectural demo plans into Firebase...");

    try {
        const batch = db.batch();
        const collectionRef = db.collection("Plan");

        // Clear existing demo plans (optional, but good for idempotency)
        const snapshot = await collectionRef.get();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Add new plans
        plans.forEach((plan) => {
            const docRef = collectionRef.doc();
            batch.set(docRef, {
                ...plan,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        });

        await batch.commit();
        console.log("Successfully seeded", plans.length, "plans!");
    } catch (error) {
        console.error("Error seeding plans:", error);
    }
}

seedPlans().then(() => process.exit(0));
