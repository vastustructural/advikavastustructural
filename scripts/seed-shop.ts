import 'dotenv/config';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        credential = admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
    }

    if (credential) {
        admin.initializeApp({
            credential,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } else {
        admin.initializeApp({ projectId: 'demo-advika' });
    }
}

const adminDb = admin.firestore();

async function main() {
    console.log("🚀 Seeding Professional Architecture Products into Firebase...");

    const products = [
        {
            name: "Modern 3BHK Duplex Elevation & Plan",
            slug: "modern-3bhk-duplex-elevation",
            description: "A highly optimized, 100% Vastu-compliant 3BHK duplex house design featuring a stunning glass and concrete modern front elevation. Includes detailed floor plans, structural layouts, and 3D renders.",
            price: "4999",
            originalPrice: "8999",
            imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            category: "Residential",
            area: "1250 sqft",
            budget: "30-40 Lakhs",
            floors: 2,
            direction: "East",
            width: 25,
            depth: 50,
            bhk: "3BHK",
            vastu: "Yes",
            code: "RES-E-3B-001",
            order: 0,
            isVisible: true,
            createdAt: new Date().toISOString()
        },
        {
            name: "Luxurious 4BHK Villa Design",
            slug: "luxurious-4bhk-villa-design",
            description: "Experience luxury with this expansive 4BHK villa design. Features a double-height living room, courtyards for natural ventilation, premium modern elevation, and complete Vastu compliance.",
            price: "9999",
            originalPrice: "14999",
            imageUrl: "https://images.unsplash.com/photo-1613490908578-77ceee688220?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            category: "Villa",
            area: "2400 sqft",
            budget: "80+ Lakhs",
            floors: 2,
            direction: "North-East",
            width: 40,
            depth: 60,
            bhk: "4BHK",
            vastu: "Yes",
            code: "VIL-NE-4B-102",
            order: 1,
            isVisible: true,
            createdAt: new Date().toISOString()
        },
        {
            name: "Compact 2BHK Floor Plan (Small Plot)",
            slug: "compact-2bhk-floor-plan",
            description: "Maximize space effortlessly. This 2BHK floor plan is explicitly designed for tight urban plots measuring 20x40. Excellent light and ventilation strategies applied.",
            price: "1999",
            originalPrice: "3499",
            imageUrl: "https://images.unsplash.com/photo-1545083036-b174ac1404fac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            category: "Floor Plan",
            area: "800 sqft",
            budget: "15-20 Lakhs",
            floors: 1,
            direction: "West",
            width: 20,
            depth: 40,
            bhk: "2BHK",
            vastu: "Doesn't Matter",
            code: "PLN-W-2B-050",
            order: 2,
            isVisible: true,
            createdAt: new Date().toISOString()
        },
        {
            name: "Commercial Complex 3D View & Layout",
            slug: "commercial-complex-3d-view",
            description: "A comprehensive structural & aesthetic design for a mid-sized commercial complex. Includes 3 levels of retail and office spaces with a glass-facade front elevation.",
            price: "15999",
            originalPrice: "24999",
            imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            category: "Commercial",
            area: "4000 sqft",
            budget: "Contact for Estimate",
            floors: 3,
            direction: "North",
            width: 50,
            depth: 80,
            bhk: "N/A",
            vastu: "Yes",
            code: "COM-N-0X-901",
            order: 3,
            isVisible: true,
            createdAt: new Date().toISOString()
        }
    ];

    try {
        const batch = adminDb.batch();
        const collection = adminDb.collection("Product");

        for (const product of products) {
            const existing = await collection.where("slug", "==", product.slug).limit(1).get();
            let docRef;
            if (!existing.empty) {
                docRef = existing.docs[0].ref;
            } else {
                docRef = collection.doc();
                (product as any).id = docRef.id;
            }
            batch.set(docRef, product, { merge: true });
        }

        await batch.commit();

        console.log(`  ✅ Successfully seeded ${products.length} Professional Architect Products!`);
    } catch (error) {
        console.error("❌ Error seeding products:", error);
    }
}

main();
