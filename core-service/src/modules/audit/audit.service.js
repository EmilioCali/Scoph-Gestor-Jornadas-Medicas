import Audit from './audit.model.js'

export function buildAuditPayload({
    userId,
    action,
    module,
    reference,
    description
}) {
    return {
        userId: userId || 'system',
        action,
        module,
        reference: reference || '',
        description
    }
}

export async function registerAudit(payload) {
    const normalizedPayload = buildAuditPayload(payload);

    try {
        return await Audit.create(normalizedPayload)

    } catch (error) {
        console.error('Error registrando auditoría', error);
        throw error;
    }
}
