import { adminDb } from "../src/lib/firebase-admin";
import "dotenv/config";
import bcrypt from "bcryptjs";

async function main() {
    console.log("🚀 Initializing Firebase Database with default content...");

    try {
        // --- Create Admin User ---
        console.log("  [1/3] Creating default Admin User...");
        const adminEmail = "admin@advika.com";
        const adminPassword = "password123";
        const userRef = adminDb.collection("AdminUser").where("email", "==", adminEmail);
        const existingUser = await userRef.get();
        if (existingUser.empty) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await adminDb.collection("AdminUser").add({
                email: adminEmail,
                password: hashedPassword,
                role: "super_admin",
                createdAt: new Date().toISOString()
            });
            console.log(`  ✅ Default Admin created: ${adminEmail} / ${adminPassword}`);
        } else {
            console.log("  ℹ️ Admin User already exists. Skipping.");
        }

        // --- Update Home Page Hero ---
        console.log("  [2/3] Updating Home Page...");
        const homeRef = adminDb.collection("HomePage").doc("singleton");
        await homeRef.set({
            id: "singleton",
            heroTitle: "Easiest Way to Design Beautiful Homes and Spaces",
            heroDescription: "House plan, 3D building elevation designs, and interior designing services at best rates. Get your home expertly designed fast easy and affordably.",
            heroButtonText: "Explore Designs",
            heroButtonLink: "/services",
        }, { merge: true });

        console.log("  ✅ Hero section updated");

        // --- Update Services ---
        const services = [
            {
                title: "Readymade House Plan",
                slug: "readymade-house-plan",
                description: "Explore our handpicked collection of expertly designed house plans with front elevation designs, and get it customized perfectly to fit your requirement.",
                icon: "🏠",
                order: 0,
            },
            {
                title: "Customized House Design",
                slug: "customized-house-design",
                description: "Use our fully personalized and customized house designing services to get your home designed as per your plot size, space requirements and budget.",
                icon: "📐",
                order: 1,
            },
            {
                title: "3D Front Elevations",
                slug: "3d-front-elevations",
                description: "Already have a floor plan? Our expert architects and house designers can help design beautiful front and side elevation and views for your dream home.",
                icon: "🏗️",
                order: 2,
            },
            {
                title: "Floor Plans",
                slug: "floor-plans",
                description: "We design best space optimized floor plans that can help you visualize the layout of the floor, and size of the specific rooms and space for your dream home.",
                icon: "📋",
                order: 3,
            },
            {
                title: "Interior Design",
                slug: "interior-design",
                description: "If you're designing or renovate your house, shop, boutique, café etc, our online 3D interior designing services will help you get that premium look within your budget.",
                icon: "🛋️",
                order: 4,
            },
            {
                title: "Vastu Consultancy",
                slug: "vastu-consultancy-premium",
                description: "Building, renovating or decorating your home as per Vastu Shastra guideline is believed to bring positivity. Our Vastu experts can help you get it right.",
                icon: "🔮",
                order: 5,
            },
        ];

        const batch = adminDb.batch();
        const servicesCollection = adminDb.collection("Service");

        for (const service of services) {
            // Check if service exists by slug
            const existing = await servicesCollection.where("slug", "==", service.slug).limit(1).get();
            let docRef;
            if (!existing.empty) {
                docRef = existing.docs[0].ref;
            } else {
                docRef = servicesCollection.doc();
                (service as any).id = docRef.id;
            }
            batch.set(docRef, service, { merge: true });
        }

        await batch.commit();

        console.log(`  ✅ ${services.length} services updated`);

        console.log("\n✨ Success: Content updated in the database!");
    } catch (error) {
        console.error("❌ Error updating content:", error);
    }
}

main();
