import { createMedicineRecord, getAllMedicines } from './medicine.service.js';
import { successResponse } from '../utils/response.js';

export const createMedicine = async (request, reply) => {
    try {
        const medicine = await createMedicineRecord(request.body);
        
        return successResponse(reply, {
            message: 'Medicamento creado exitosamente',
            data: medicine,
            statusCode: 201
        })
    } catch (error) {
            return reply.status(400).send({
            success: false,
            message: 'Error al crear el medicamento',
            error: error.message,
        });
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
        return reply.status(500).send({
            success: false,
            message: 'Error al obtener medicamentos',
            error: error.message,
        });
    }
};