import 'dotenv/config';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    let credential;

    // We can use a service account JSON string stored in an environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            credential = admin.credential.cert(serviceAccount);
        } catch (error) {
            console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY', error);
        }
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        // Alternatively, use individual env vars
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
        console.warn('Firebase Admin credentials not found in env. Falling back to default initialization.');
        try {
            admin.initializeApp({ projectId: 'demo-advika' });
        } catch (e) {
            console.warn('Fallback init failed', e);
        }
    }
}

const adminDb = admin.firestore();

export { adminDb, admin };
