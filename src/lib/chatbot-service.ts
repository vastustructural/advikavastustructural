export interface AiLead {
    name: string;
    phone: string;
    message?: string;
}

export async function saveAiLead(lead: AiLead) {
    try {
        const response = await fetch('/api/ai-leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead),
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success) {
            return { success: false, error: data?.error || 'Failed to save AI lead' };
        }

        return { success: true, id: data.id };
    } catch (error) {
        console.error('Error saving AI lead:', error);
        return { success: false, error };
    }
}
