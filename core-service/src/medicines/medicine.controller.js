import {
    createMedicineRecord,
    getAllMedicines,
    updateMedicineRecord,
    toggleMedicineStatusRecord
} from './medicine.service.js';
import { successResponse } from '../utils/response.js';
import { handleServiceError } from '../utils/errorHandler.js';
import { registerAudit } from '../modules/audit/audit.service.js';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '../modules/audit/audit.constants.js';
import { AUDIT_MESSAGES } from '../modules/audit/audit.messages.js';

export const createMedicine = async (request, reply) => {
    try {
        const medicine = await createMedicineRecord(request.body);
        await registerAudit({
            userId: request.user?.id || 'system',
            action: AUDIT_ACTIONS.CREAR,
            module: AUDIT_MODULES.MEDICINES,
            reference: medicine?._id?.toString() || '',
            description: AUDIT_MESSAGES.MEDICAMENTO_CREADO
        });
        
        return successResponse(reply, {
            message: 'Medicamento creado exitosamente',
            data: medicine,
            statusCode: 201
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};

export const getMedicines = async (request, reply) => {
    try {
        const medicines = await getAllMedicines();
        return successResponse(reply, {
            message: 'Medicamentos obtenidos exitosamente',
            data: medicines,
            statusCode: 200
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};

export const updateMedicine = async (request, reply) => {
    try {
        const { id } = request.params;
        const medicine = await updateMedicineRecord(id, request.body);
        await registerAudit({
            userId: request.user?.id || 'system',
            action: AUDIT_ACTIONS.ACTUALIZAR,
            module: AUDIT_MODULES.MEDICINES,
            reference: medicine?._id?.toString() || id,
            description: AUDIT_MESSAGES.MEDICAMENTO_ACTUALIZADO
        });
        return successResponse(reply, {
            message: 'Medicamento actualizado exitosamente',
            data: medicine,
            statusCode: 200
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};

export const toggleMedicineStatus = async (request, reply) => {
    try {
        const { id } = request.params;
        const { status } = request.body;
        const medicine = await toggleMedicineStatusRecord(id, status);
        await registerAudit({
            userId: request.user?.id || 'system',
            action: status === 'ACTIVO' ? AUDIT_ACTIONS.ACTIVAR : AUDIT_ACTIONS.DESACTIVAR,
            module: AUDIT_MODULES.MEDICINES,
            reference: medicine?._id?.toString() || id,
            description: status === 'ACTIVO' ? AUDIT_MESSAGES.MEDICAMENTO_ACTIVADO : AUDIT_MESSAGES.MEDICAMENTO_DESACTIVADO
        });
        return successResponse(reply, {
            message: `Medicamento ${status === 'ACTIVO' ? 'activado' : 'desactivado'} exitosamente`,
            data: medicine,
            statusCode: 200
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};