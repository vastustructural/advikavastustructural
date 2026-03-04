import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface AiLead {
    name: string;
    phone: string;
    message?: string;
}

export async function saveAiLead(lead: AiLead) {
    try {
        const leadsRef = collection(db, 'ai_leads');
        const docRef = await addDoc(leadsRef, {
            ...lead,
            createdAt: serverTimestamp(),
            source: 'Little Adu AI',
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error saving AI lead to Firestore:', error);
        return { success: false, error };
    }
}
