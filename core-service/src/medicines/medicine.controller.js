import {
    createMedicineRecord,
    getAllMedicines,
    updateMedicineRecord,
    toggleMedicineStatusRecord
} from './medicine.service.js';
import { successResponse } from '../utils/response.js';
import { handleServiceError } from '../utils/errorHandler.js';

export const createMedicine = async (request, reply) => {
    try {
        const medicine = await createMedicineRecord(request.body);
        
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
        return successResponse(reply, {
            message: `Medicamento ${status === 'ACTIVO' ? 'activado' : 'desactivado'} exitosamente`,
            data: medicine,
            statusCode: 200
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};