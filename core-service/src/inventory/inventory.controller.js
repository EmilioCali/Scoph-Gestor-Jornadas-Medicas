import centralInventory from "./centralInventory.model.js";
import WorkdayInventory from './workdayInventory.model.js';
import { registrarEntrada, calculateBaseUnits } from './inventory.service.js';
import { getWorkdayById } from '../workdays/workday.client.js';
import Medicine from '../medicines/medicine.model.js';
import { handleServiceError } from '../utils/errorHandler.js';
import { successResponse } from '../utils/response.js';
import { registerAudit } from '../modules/audit/audit.service.js';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '../modules/audit/audit.constants.js';
import { AUDIT_MESSAGES } from '../modules/audit/audit.messages.js';

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
                    minimumUnit: '$medicine.minimumUnit',
                    intermediateUnit: '$medicine.intermediateUnit',
                    packageUnit: '$medicine.packageUnit',
                    unitsPerPackage: '$medicine.unitsPerPackage',
                    unitsPerMinimumUnit: '$medicine.unitsPerMinimumUnit',
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
        const { medicineId, minimumStock, batch, expirationDate, initialStock, userId, boxes = 0, blisters = 0, units = 0, entryQuantity, entryUnit, entryUnitType, quantity } = request.body;

        let normalizedBoxes = Number(boxes) || 0;
        let normalizedBlisters = Number(blisters) || 0;
        let normalizedUnits = Number(units) || 0;

        const selectedEntryUnit = entryUnitType ?? entryUnit ?? null;
        const amount = Number(entryQuantity ?? quantity ?? 0) || 0;

        if (amount > 0 && selectedEntryUnit) {
            const medicine = await Medicine.findById(medicineId);
            if (medicine) {
                if (String(selectedEntryUnit) === String(medicine.packageUnit)) {
                    normalizedBoxes = amount;
                } else if (medicine.intermediateUnit && String(selectedEntryUnit) === String(medicine.intermediateUnit)) {
                    normalizedBlisters = amount;
                } else if (String(selectedEntryUnit) === String(medicine.minimumUnit)) {
                    normalizedUnits = amount;
                } else {
                    normalizedUnits = amount;
                }
                if (calculateBaseUnits(amount, selectedEntryUnit, medicine) <= 0) {
                    normalizedUnits = amount;
                }
            }
        }

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
        const boxCount = normalizedBoxes;
        const blisterCount = normalizedBlisters;
        const unitCount = normalizedUnits;

        if (stock > 0 || boxCount > 0 || blisterCount > 0 || unitCount > 0) {
            lots.push({ batch, expirationDate, boxes: boxCount, blisters: blisterCount, units: unitCount, stock });

            await registrarEntrada({
                tipoEntrada: 'DONACION',
                destination: { type: 'INVENTARIO_CENTRAL', id: null },
                detalle: [{ medicineId, batch, quantity: stock, boxes: boxCount, blisters: blisterCount, units: unitCount, expirationDate }],
                userId: userId ?? 'system',
            });
            await registerAudit({
                userId: userId ?? request.user?.id ?? 'system',
                action: AUDIT_ACTIONS.CREAR,
                module: AUDIT_MODULES.INVENTORY,
                reference: medicineId,
                description: AUDIT_MESSAGES.INVENTARIO_AGREGADO,
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

export const updateCentralInventoryLot = async (request, reply) => {
    try {
        const { medicineId, batch: currentBatch } = request.params;
        const { batch, expirationDate, entryQuantity, entryUnit } = request.body;
        const quantity = Number(entryQuantity) || 0;

        if (!batch || !expirationDate || quantity <= 0 || !entryUnit) {
            return reply.status(400).send({ success: false, message: 'Lote, vencimiento, cantidad y unidad son obligatorios' });
        }

        const [inventory, medicine] = await Promise.all([
            centralInventory.findOne({ medicineId }),
            Medicine.findById(medicineId),
        ]);
        if (!inventory || !medicine) {
            return reply.status(404).send({ success: false, message: 'Inventario o medicamento no encontrado' });
        }

        const lot = inventory.lots.find((item) => item.batch === currentBatch);
        if (!lot) {
            return reply.status(404).send({ success: false, message: 'El lote no fue encontrado' });
        }
        if (batch !== currentBatch && inventory.lots.some((item) => item.batch === batch)) {
            return reply.status(409).send({ success: false, message: 'Ya existe un lote con ese número' });
        }
        if (new Date(expirationDate) <= new Date()) {
            return reply.status(400).send({ success: false, message: 'La fecha de vencimiento debe ser futura' });
        }

        lot.batch = batch;
        lot.expirationDate = expirationDate;
        lot.boxes = entryUnit === medicine.packageUnit ? quantity : 0;
        lot.blisters = entryUnit === medicine.intermediateUnit ? quantity : 0;
        lot.units = entryUnit === medicine.minimumUnit ? quantity : 0;
        lot.stock = 0;

        inventory.totalStock = inventory.lots.reduce((total, item) => {
            const boxes = Number(item.boxes) || 0;
            const blisters = Number(item.blisters) || 0;
            const units = Number(item.units) || 0;
            const hasBreakdown = boxes > 0 || blisters > 0 || units > 0;
            if (!hasBreakdown) return total + (Number(item.stock) || 0);

            return total
                + calculateBaseUnits(boxes, medicine.packageUnit, medicine)
                + calculateBaseUnits(blisters, medicine.intermediateUnit, medicine)
                + units;
        }, 0);
        await inventory.save();
        await registerAudit({
            userId: request.user?.id || 'system',
            action: AUDIT_ACTIONS.ACTUALIZAR,
            module: AUDIT_MODULES.INVENTORY,
            reference: medicineId,
            description: AUDIT_MESSAGES.INVENTARIO_LOTE_ACTUALIZADO,
        });

        return successResponse(reply, {
            message: 'Lote actualizado exitosamente',
            data: inventory,
            statusCode: 200,
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};
