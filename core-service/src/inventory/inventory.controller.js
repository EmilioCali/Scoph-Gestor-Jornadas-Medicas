import centralInventory from "./centralInventory.model.js";
import WorkdayInventory from './workdayInventory.model.js';
import { registrarEntrada } from './inventory.service.js';
import { getWorkdayById } from '../workdays/workday.client.js';
import { handleServiceError } from '../utils/errorHandler.js';
import { successResponse } from '../utils/response.js';

export const getInventarioCentral = async (request, reply) => {
    try {
        const inventarios = await centralInventory.aggregate([
            {
                $lookup: {
                    from: 'medicines',
                    localField: 'medicineId',
                    foreignField: '_id',
                    as: 'medicine'
                }
            },
            { $unwind: '$medicine' },
            {
                $project: {
                    medicineId: '$medicine._id',
                    name: '$medicine.name',
                    compound: '$medicine.compound',
                    category: '$medicine.category',
                    unitOfMeasure: '$medicine.unitOfMeasure',
                    lots: 1,
                    totalStock: 1,
                    minimumStock: 1,
                    updatedAt: 1
                }
            }
        ]);

        return successResponse(reply, {
            message: 'Inventario central obtenido exitosamente',
            data: inventarios,
            statusCode: 200
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};

// Agrega un medicamento al inventario con stock mínimo y lote inicial (si initialStock > 0)
export const addMedicineToInventory = async (request, reply) => {
    try {
        const { medicineId, minimumStock, batch, expirationDate, initialStock, userId } = request.body;

        const existing = await centralInventory.findOne({ medicineId });
        if (existing) {
            return reply.status(409).send({
                success: false,
                message: 'Este medicamento ya existe en el inventario central',
                error: 'CONFLICT'
            });
        }

        const lots = [];
        const stock = Number(initialStock) || 0;

        if (stock > 0) {
            lots.push({ batch, expirationDate, stock });

            // Si hay stock inicial, registrarlo como movimiento de entrada tipo DONACION
            await registrarEntrada({
                tipoEntrada: 'DONACION',
                destination: { type: 'INVENTARIO_CENTRAL', id: null },
                detalle: [{ medicineId, batch, quantity: stock, expirationDate }],
                userId: userId ?? 'system',
            });
        } else {
            // Sin stock inicial — crear el registro vacío directamente
            const inv = new centralInventory({ medicineId, lots: [], totalStock: 0, minimumStock: Number(minimumStock) });
            await inv.save();
        }

        const inv = await centralInventory.findOne({ medicineId }).populate('medicineId');

        return successResponse(reply, {
            message: 'Medicamento agregado al inventario central',
            data: inv,
            statusCode: 201
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};

export const getInventarioJornada = async (request, reply) => {
    try {
        const { jornadaId } = request.params;

        // Valida existencia y, para MEDICO, asignación a la jornada (propaga 403)
        await getWorkdayById(jornadaId, request.headers.authorization);

        const inventario = await WorkdayInventory.find({ workdayId: jornadaId }).populate('medicineId');

        return successResponse(reply, {
            message: 'Inventario de jornada obtenido exitosamente',
            data: inventario,
            statusCode: 200
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};