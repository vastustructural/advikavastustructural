import 'dotenv/config';
import { Client } from 'pg';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Assuming we have credentials)
if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
        });
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
    } else {
        console.error("Firebase credentials not found in environment variables. Please populate FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env");
        process.exit(1);
    }
}

const db = admin.firestore();

async function migrate() {
    console.log("Starting migration...");
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log("Connected to PostgreSQL.");
    } catch (error) {
        console.error("Failed to connect to PostgreSQL:", error);
        process.exit(1);
    }

    const tableMapping: Record<string, string> = {
        "User": "AdminUser", // Map User table to AdminUser collection
        "Service": "Service",
        "Plan": "Plan",
        "Product": "Product",
        "GalleryCategory": "GalleryCategory",
        "GalleryItem": "GalleryItem",
        "Testimonial": "Testimonial",
        "ContactSubmission": "ContactSubmission",
        "Referrer": "Referrer",
        "Payment": "Payment",
        "HomePage": "HomePage",
        "LegalPage": "LegalPage",
        "GlobalSettings": "GlobalSettings",
        "Calculator": "Calculator",
        "CtaSection": "CtaSection",
        "ChatSession": "ChatSession",
        "ChatMessage": "ChatMessage",
    };

    for (const [pgTable, fsCollection] of Object.entries(tableMapping)) {
        try {
            console.log(`Migrating table '${pgTable}' to collection '${fsCollection}'...`);
            const res = await client.query(`SELECT * FROM "${pgTable}"`);

            const batch = db.batch();
            let count = 0;

            for (const row of res.rows) {
                let id = row.id || row.key;
                if (!id) {
                    console.warn(`Row in ${pgTable} has no id or key. Skipping.`, row);
                    continue;
                }

                // If migrating User to AdminUser, we might need to adjust the role according to auth.ts expectations
                if (pgTable === "User") {
                    // auth.ts asks for "super_admin", if it was ADMIN in pg, let's map it.
                    if (row.role === 'ADMIN') {
                        row.role = 'super_admin';
                    }
                }

                const docRef = db.collection(fsCollection).doc(id.toString());
                const data = { ...row };

                // Clean Date objects to ISO strings
                for (const key in data) {
                    if (data[key] instanceof Date) {
                        data[key] = data[key].toISOString();
                    }
                }

                batch.set(docRef, data);
                count++;

                if (count % 400 === 0) {
                    await batch.commit();
                    console.log(`  Committed ${count} items to ${fsCollection}.`);
                }
            }

            if (count % 400 !== 0) {
                await batch.commit();
            }

            console.log(`Successfully migrated ${count} records for '${fsCollection}'.\n`);
        } catch (error: any) {
            console.error(`Error migrating table '${pgTable}':`, error.message, '\n');
        }
    }

    await client.end();
    console.log("Migration completed successfully.");
}

migrate().catch((error) => {
    console.error("Fatal Migration Error:", error);
});
