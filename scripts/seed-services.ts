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

const services = [
    {
        title: "Vastu Shastra Consultation",
        slug: "vastu-shastra-consultation",
        description: "Expert Vastu-Shastra analysis for your residential or commercial property to ensure positive energy flow, health, and prosperity.",
        icon: "🧭",
        price: "4999",
        originalPrice: "7999",
        sampleImageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop",
        sampleDocumentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        inclusions: [
            "Site Visit Data Analysis",
            "Directional Energy Auditing",
            "Custom Vastu Correction Report",
            "Remedies without Demolition",
            "1-on-1 Consultation Call"
        ],
        processSteps: [
            "We collect your plot dimensions and floor plans.",
            "Our Vastu experts analyze the magnetic axis and energy zones.",
            "We mathematically calculate doshas (flaws) and prepare corrections.",
            "You receive a comprehensive visual report with actionable remedies."
        ],
        deliverables: [
            "Detailed Vastu Analysis PDF",
            "Color Palette & Placement Guide",
            "Remedial Objects Shopping List"
        ],
        order: 1,
        isVisible: true
    },
    {
        title: "Premium 3D Exterior Elevation",
        slug: "premium-3d-exterior-elevation",
        description: "Breathtaking, photorealistic 3D architectural renders of your home's exterior. See exactly how your house will look before a single brick is laid.",
        icon: "🏛️",
        price: "9999",
        originalPrice: "14999",
        sampleImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        inclusions: [
            "2 Unique Design Concepts",
            "Ultra-High-Res Dual Angle Renders",
            "Material & Texturing Spec Sheet",
            "Day & Night Lighting Views",
            "2 Free Revision Rounds"
        ],
        processSteps: [
            "Submit your 2D CAD floor plans and style preferences.",
            "We create a base 3D structural model for your approval.",
            "Textures, materials, lighting, and landscaping are applied.",
            "Final high-res cinematic rendering is processed."
        ],
        deliverables: [
            "4K Resolution JPG Renders (Day & Night)",
            "Material Code Reference Sheet",
            "Video Walkthrough (Add-on)"
        ],
        order: 2,
        isVisible: true
    },
    {
        title: "Comprehensive Structural Design",
        slug: "comprehensive-structural-design",
        description: "Engineered for absolute safety and longevity. Get precise, government-approved structural calculations and reinforcement drawings.",
        icon: "🏗️",
        price: "19999",
        originalPrice: "24999",
        sampleImageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop",
        inclusions: [
            "Load Bearing Calculations",
            "Column & Footing Details",
            "Slab & Beam Reinforcements",
            "Earthquake Resistance Checks",
            "Staircase Detailing"
        ],
        processSteps: [
            "Architectural plans are imported into structural analysis software.",
            "Dead, live, and seismic loads are calculated based on IS Codes.",
            "Reinforcement steel sizing and placements are optimized.",
            "Final AutoCAD structural drawings are generated."
        ],
        deliverables: [
            "Signed Structural PDF Drawings",
            "AutoCAD DWG Source Files",
            "Steel Quantity Estimation (BOQ)"
        ],
        order: 3,
        isVisible: true
    }
];

async function seedServices() {
    console.log("Seeding professional architectural services into Firebase...");

    try {
        const batch = db.batch();
        const collectionRef = db.collection("Service");

        // Clear existing demo services
        const snapshot = await collectionRef.get();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Add new services
        services.forEach((service) => {
            const docRef = collectionRef.doc();
            batch.set(docRef, {
                ...service,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        });

        await batch.commit();
        console.log("Successfully seeded", services.length, "services!");
    } catch (error) {
        console.error("Error seeding services:", error);
    }
}

seedServices().then(() => process.exit(0));
