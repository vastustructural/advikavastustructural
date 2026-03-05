import { adminDb } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { apiError, checkRateLimit, getClientIp, sanitizeObject, validateFields } from '@/lib/api-utils';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        const { limited, errorResponse } = checkRateLimit(`ai-leads-${ip}`, 10, 60000);
        if (limited) return errorResponse;

        const body = await req.json();
        const { valid, errorResponse: fieldError } = validateFields(body, ['name', 'phone']);
        if (!valid) return fieldError;

        const sanitized = sanitizeObject(body, ['name', 'phone', 'message']);
        const newId = nanoid();
        const leadData = {
            id: newId,
            name: sanitized.name,
            phone: sanitized.phone,
            message: sanitized.message || '',
            source: 'Little Adu AI',
            createdAt: new Date().toISOString(),
        };

        const sessionData = {
            id: newId,
            guestName: sanitized.name,
            email: null,
            phone: sanitized.phone,
            createdAt: new Date().toISOString(),
        };

        await adminDb.collection('ai_leads').doc(newId).set(leadData);
        await adminDb.collection('ChatSession').doc(newId).set(sessionData);

        return NextResponse.json({ success: true, id: newId }, { status: 201 });
    } catch (error) {
        console.error('[AI Leads API] POST Error:', error);
        return apiError('Failed to save AI lead');
    }
}
