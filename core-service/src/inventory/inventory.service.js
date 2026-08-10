import mongoose from 'mongoose';
import centralInventory from "./centralInventory.model.js";
import Movement from '../movements/movement.model.js'
import Medicine from '../medicines/medicine.model.js'
import WorkdayInventory from './workdayInventory.model.js';
import { getWorkdayById } from '../workdays/workday.client.js';
import { validarLoteExistente, validarNoVencido, validarStockPositivo } from "../utils/validator.js";

function getConversionFactors(medicine = {}) {
    const unitsPerPackage = Math.max(1, Number(medicine?.unitsPerPackage ?? 1) || 1);
    const unitsPerMinimumUnit = Math.max(1, Number(medicine?.unitsPerMinimumUnit ?? 1) || 1);
    const hasIntermediate = Boolean(medicine?.intermediateUnit && String(medicine.intermediateUnit).trim() && unitsPerMinimumUnit > 1);

    return { unitsPerPackage, unitsPerMinimumUnit, hasIntermediate };
}

export function calculateBaseUnits(quantity, entryUnitType, medicine = {}) {
    const qty = Math.max(0, Number(quantity) || 0);
    const normalizedEntryUnitType = typeof entryUnitType === 'string' ? entryUnitType.trim() : '';
    const unitsPerPackage = Math.max(1, Number(medicine?.unitsPerPackage ?? 1) || 1);
    const unitsPerMinimumUnit = Math.max(1, Number(medicine?.unitsPerMinimumUnit ?? 1) || 1);
    const hasIntermediate = Boolean(medicine?.intermediateUnit && String(medicine.intermediateUnit).trim() && unitsPerMinimumUnit > 1);

    if (normalizedEntryUnitType === medicine?.packageUnit) {
        return hasIntermediate
            ? qty * unitsPerPackage * unitsPerMinimumUnit
            : qty * unitsPerPackage;
    }

    if (hasIntermediate && normalizedEntryUnitType === medicine?.intermediateUnit) {
        return qty * unitsPerMinimumUnit;
    }

    return qty;
}

function normalizeLotData(item, medicine = {}) {
    const quantity = Math.max(0, Number(item.quantity ?? item.cantidad ?? 0) || 0);
    const entryUnitType = item.entryUnitType ?? item.entryUnit ?? item.unitType ?? item.unit ?? null;
    const normalizedEntryUnitType = typeof entryUnitType === 'string' ? entryUnitType.trim() : '';
    const { unitsPerPackage, unitsPerMinimumUnit } = getConversionFactors(medicine);

    let boxes = Number(item.boxes || 0);
    let blisters = Number(item.blisters || 0);
    let units = Number(item.units || 0);

    if (normalizedEntryUnitType) {
        if (normalizedEntryUnitType === medicine?.packageUnit) {
            boxes = quantity;
            blisters = 0;
            units = 0;
        } else if (normalizedEntryUnitType === medicine?.intermediateUnit) {
            boxes = 0;
            blisters = quantity;
            units = 0;
        } else if (normalizedEntryUnitType === medicine?.minimumUnit) {
            boxes = 0;
            blisters = 0;
            units = quantity;
        }
    } else if (quantity > 0 && boxes === 0 && blisters === 0 && units === 0) {
        units = quantity;
    }

    const totalUnits = normalizedEntryUnitType
        ? calculateBaseUnits(quantity, normalizedEntryUnitType, medicine)
        : ((boxes * unitsPerPackage) + (blisters * unitsPerMinimumUnit) + units + quantity);

    return {
        boxes,
        blisters,
        units,
        quantity,
        totalUnits
    };
}

function normalizeMovementAmount(payload = {}, medicine = {}) {
    const quantity = Math.max(0, Number(payload.quantity ?? payload.cantidad ?? 0) || 0);
    const entryUnitType = payload.entryUnitType ?? payload.entryUnit ?? payload.unitType ?? payload.unit ?? null;
    const normalizedEntryUnitType = typeof entryUnitType === 'string' ? entryUnitType.trim() : '';
    const { unitsPerPackage, unitsPerMinimumUnit } = getConversionFactors(medicine);

    let boxes = Number(payload.boxes || 0);
    let blisters = Number(payload.blisters || 0);
    let units = Number(payload.units || 0);

    if (normalizedEntryUnitType) {
        if (normalizedEntryUnitType === medicine?.packageUnit) {
            boxes = quantity;
            blisters = 0;
            units = 0;
        } else if (normalizedEntryUnitType === medicine?.intermediateUnit) {
            boxes = 0;
            blisters = quantity;
            units = 0;
        } else if (normalizedEntryUnitType === medicine?.minimumUnit) {
            boxes = 0;
            blisters = 0;
            units = quantity;
        }
    } else if (quantity > 0 && boxes === 0 && blisters === 0 && units === 0) {
        units = quantity;
    }

    const totalUnits = normalizedEntryUnitType
        ? calculateBaseUnits(quantity, normalizedEntryUnitType, medicine)
        : ((boxes * unitsPerPackage) + (blisters * unitsPerMinimumUnit) + units + quantity);

    return {
        boxes,
        blisters,
        units,
        quantity,
        totalUnits,
    };
}

function addLotStock(lote, { boxes, blisters, units, quantity }) {
    lote.boxes = (Number(lote.boxes) || 0) + boxes;
    lote.blisters = (Number(lote.blisters) || 0) + blisters;
    lote.units = (Number(lote.units) || 0) + units;
    lote.stock = (Number(lote.stock) || 0) + quantity;
}

function getLotUnitValue(lote, medicine = {}) {
    const { unitsPerPackage, unitsPerMinimumUnit } = getConversionFactors(medicine);
    return ((Number(lote.boxes) || 0) * unitsPerPackage) + ((Number(lote.blisters) || 0) * unitsPerMinimumUnit) + (Number(lote.units) || 0) + (Number(lote.stock) || 0);
}

function subtractLotUnits(lote, amount, medicine = {}) {
    let remaining = Math.max(0, Number(amount) || 0);
    const { unitsPerPackage, unitsPerMinimumUnit } = getConversionFactors(medicine);

    const boxesToRemove = Math.min(Math.floor(remaining / unitsPerPackage), Number(lote.boxes) || 0);
    remaining -= boxesToRemove * unitsPerPackage;
    lote.boxes = Math.max(0, (Number(lote.boxes) || 0) - boxesToRemove);

    const blistersToRemove = Math.min(Math.floor(remaining / unitsPerMinimumUnit), Number(lote.blisters) || 0);
    remaining -= blistersToRemove * unitsPerMinimumUnit;
    lote.blisters = Math.max(0, (Number(lote.blisters) || 0) - blistersToRemove);

    const unitsToRemove = Math.min(remaining, Number(lote.units) || 0);
    remaining -= unitsToRemove;
    lote.units = Math.max(0, (Number(lote.units) || 0) - unitsToRemove);

    if (remaining > 0) {
        lote.stock = Math.max(0, (Number(lote.stock) || 0) - remaining);
    }
}

export async function registrarEntrada({ tipoEntrada, detalle, userId, destination, metadata }) {
    const movimientos = [];

    for (const item of detalle) {
        const { medicineId, batch, expirationDate } = item;
        const med = await Medicine.findById(medicineId);
        if (!med) throw new Error("Medicamento no encontrado");
        const { boxes, blisters, units, quantity, totalUnits } = normalizeLotData(item, med);

        if (totalUnits <= 0) throw new Error("La cantidad debe de ser positiva");
        if (new Date(expirationDate) <= new Date()) throw new Error("La fecha de vencimiento debe de ser una futura");

        const movimiento = new Movement({
            type: 'ENTRADA',
            subType: tipoEntrada,
            origin: { type: 'EXTERNO' },
            destination,
            detail: [{
                medicineId,
                medicationSnapshot: { name: med.name, concentration: med.concentration },
                batch,
                quantity,
                boxes,
                blisters,
                units,
                expirationDate
            }],
            status: 'APLICADO',
            userId,
            appliedAt: new Date()
        })
        await movimiento.save();
        movimientos.push(movimiento)

        let inv = await centralInventory.findOne({ medicineId })
        if (!inv) {
            inv = new centralInventory({ medicineId, lots: [], totalStock: 0 })
        }

        const loteExistente = inv.lots.find(l => l.batch === batch)
        if (loteExistente) {
            addLotStock(loteExistente, { boxes, blisters, units, quantity })
        } else {
            inv.lots.push({ batch, expirationDate, boxes, blisters, units, stock: quantity })
        }

        inv.totalStock += totalUnits
        await inv.save()

    }
    return movimientos
}

//salida por receta
export async function registrarSalidaReceta({ detalle, userId, destination, metadata }) {
    const movimientos = [];

    for (const item of detalle) {
        const { medicineId, batch } = item;
        const med = await Medicine.findById(medicineId);
        if (!med) throw new Error("Medicamento no encontrado, lo siento");
        const { boxes, blisters, units, quantity, totalUnits } = normalizeLotData(item, med);

        const inv = await centralInventory.findOne({ medicineId });
        if (!inv) throw new Error("No existe inventario para este medicamento");

        const lote = inv.lots.find(l => l.batch === batch);
        if (!lote) throw new Error("El lote no se ha encontrado");

        const availableUnits = getLotUnitValue(lote);
        if (availableUnits < totalUnits) {
            throw new Error(`Stock insuficiente en el lote ${batch}. Disponible: ${availableUnits}, solicitado: ${totalUnits}`);
        }

        subtractLotUnits(lote, totalUnits);
        inv.totalStock = Math.max(0, (Number(inv.totalStock) || 0) - totalUnits);

        await inv.save();

        const movimiento = new Movement({
            type: "SALIDA",
            subType: "RECETA",
            origin: { type: "INVENTARIO_CENTRAL", id: null },
            destination,
            detail: [{
                medicineId,
                medicationSnapshot: { name: med.name, concentration: med.concentration },
                batch,
                quantity,
                boxes,
                blisters,
                units,
                expirationDate: lote.expirationDate
            }],
            status: "APLICADO",
            userId,
            metadata,
            appliedAt: new Date()
        });

        await movimiento.save();
        movimientos.push(movimiento);

    }
    return movimientos;

}

export async function registrarTransferencia({ jornadaId, jornadaNombre, detalle, userId, authHeader }) {
    const movimientos = [];
    await getWorkdayById(jornadaId, authHeader);

    for (const item of detalle) {
        const { medicineId, batch } = item;
        const med = await Medicine.findById(medicineId);
        if (!med) throw new Error('Medicamento no encontrado');
        const { boxes, blisters, units, quantity, totalUnits } = normalizeLotData(item, med);

        const inv = await centralInventory.findOne({ medicineId });
        if (!inv) throw new Error('No existe inventario para este medicamento');

        const lote = inv.lots.find(l => l.batch === batch);
        if (!lote) throw new Error('El lote no se ha encontrado');

        const availableUnits = getLotUnitValue(lote);
        if (availableUnits < totalUnits) {
            throw new Error(`Stock insuficiente en el lote ${batch}. Disponible: ${availableUnits}, solicitado: ${totalUnits}`);
        }

        subtractLotUnits(lote, totalUnits);
        inv.totalStock = Math.max(0, (Number(inv.totalStock) || 0) - totalUnits);
        await inv.save();

        let invJornada = await WorkdayInventory.findOne({ workdayId: jornadaId, medicineId });
        if (!invJornada) {
            invJornada = new WorkdayInventory({
                workdayId: jornadaId,
                workdayName: jornadaNombre,
                medicineId,
                lots: [],
                totalStock: 0
            });
        }

        const loteJornada = invJornada.lots.find(l => l.batch === batch);
        if (loteJornada) {
            addLotStock(loteJornada, { boxes, blisters, units, quantity });
        } else {
            invJornada.lots.push({ batch, expirationDate: lote.expirationDate, boxes, blisters, units, stock: quantity });
        }
        invJornada.totalStock += totalUnits;
        await invJornada.save();

        const movimiento = new Movement({
            type: 'TRANSFERENCIA',
            subType: 'ASIGNACION_JORNADA',
            origin: { type: 'INVENTARIO_CENTRAL', id: null },
            destination: { type: 'INVENTARIO_JORNADA', id: jornadaId },
            detail: [{
                medicineId,
                medicationSnapshot: { name: med.name, concentration: med.concentration },
                batch,
                quantity,
                boxes,
                blisters,
                units,
                expirationDate: lote.expirationDate
            }],
            status: 'APLICADO',
            userId,
            metadata: { reason: `Asignación a jornada ${jornadaNombre}` },
            appliedAt: new Date()
        });

        await movimiento.save();
        movimientos.push(movimiento);
    }

    return movimientos;
}

async function getWorkdayInventory(productoId) {
    const inventory = await WorkdayInventory.findOne({ medicineId: new mongoose.Types.ObjectId(productoId) });
    if (!inventory) {
        throw new Error('Inventario de jornada no encontrado');
    }
    return inventory;
}


export async function validarStockJornada(productoId, payload = {}) {
    const inventory = await getWorkdayInventory(productoId);
    const medicine = await Medicine.findById(inventory.medicineId);
    if (!medicine) {
        throw new Error('Medicamento no encontrado');
    }

    const { totalUnits, quantity, boxes, blisters, units } = normalizeMovementAmount(payload, medicine);

    const ahora = new Date();
    const lote = inventory.lots.find(
        (l) => getLotUnitValue(l, medicine) > 0 && new Date(l.expirationDate) >= ahora
    );

    validarLoteExistente(lote);
    validarNoVencido(lote.expirationDate);

    const disponible = getLotUnitValue(lote, medicine);
    if (disponible < totalUnits) {
        throw new Error(`Stock insuficiente. Disponible: ${disponible}, solicitado: ${totalUnits}`);
    }

    validarStockPositivo(disponible);

    return { inventory, lote, boxes, blisters, units, quantity, totalUnits };
}

export async function descontarStockJornada(productoId, payload = {}) {
    const { inventory, lote, totalUnits } = await validarStockJornada(productoId, payload);
    const medicine = await Medicine.findById(inventory.medicineId);
    if (!medicine) {
        throw new Error('Medicamento no encontrado');
    }

    subtractLotUnits(lote, totalUnits, medicine);
    inventory.totalStock = Math.max(0, (Number(inventory.totalStock) || 0) - totalUnits);

    await inventory.save();

    return { inventory, lote, medicine };
}

export async function procesarRetornoJornada(productoId, payload = {}) {
    const inventory = await getWorkdayInventory(productoId);
    const medicine = await Medicine.findById(inventory.medicineId);
    if (!medicine) {
        throw new Error('Medicamento no encontrado');
    }

    const { boxes, blisters, units, quantity, totalUnits } = normalizeMovementAmount(payload, medicine);
    validarLoteExistente(inventory);

    const lote = inventory.lots[0];
    validarLoteExistente(lote);
    validarNoVencido(lote.expirationDate);

    lote.boxes = (Number(lote.boxes) || 0) + boxes;
    lote.blisters = (Number(lote.blisters) || 0) + blisters;
    lote.units = (Number(lote.units) || 0) + units;
    lote.stock = (Number(lote.stock) || 0) + quantity;
    inventory.totalStock = (Number(inventory.totalStock) || 0) + totalUnits;

    await inventory.save();

    return { inventory, lote, medicine };
}

export async function procesarRetornoAutomaticoJornada({ workdayId, userId = 'system' }) {
    const workdayInventories = await WorkdayInventory.find({ workdayId });
    const movimientos = [];

    for (const inventory of workdayInventories) {
        if (!inventory) continue;

        const totalStock = Number(inventory.totalStock || 0);
        if (totalStock <= 0) continue;

        const medicine = await Medicine.findById(inventory.medicineId);
        if (!medicine) continue;

        for (const lote of inventory.lots || []) {
            const boxes = Number(lote.boxes || 0);
            const blisters = Number(lote.blisters || 0);
            const units = Number(lote.units || 0);
            const stock = Number(lote.stock || 0);
            const { unitsPerPackage, unitsPerMinimumUnit } = getConversionFactors(medicine);
            const totalUnits = (boxes * unitsPerPackage) + (blisters * unitsPerMinimumUnit) + units + stock;

            if (totalUnits <= 0) continue;

            let invCentral = await centralInventory.findOne({ medicineId: inventory.medicineId });
            if (!invCentral) {
                invCentral = new centralInventory({
                    medicineId: inventory.medicineId,
                    lots: [],
                    totalStock: 0,
                });
            }

            const loteCentral = invCentral.lots.find((item) => item.batch === lote.batch);
            if (loteCentral) {
                addLotStock(loteCentral, { boxes, blisters, units, quantity: stock });
            } else {
                invCentral.lots.push({
                    batch: lote.batch,
                    expirationDate: lote.expirationDate,
                    boxes,
                    blisters,
                    units,
                    stock,
                });
            }

            invCentral.totalStock = (Number(invCentral.totalStock) || 0) + totalUnits;
            await invCentral.save();

            const movimiento = await Movement.create({
                type: 'ENTRADA',
                subType: 'RETORNO_JORNADA',
                origin: { type: 'INVENTARIO_JORNADA', id: workdayId },
                destination: { type: 'INVENTARIO_CENTRAL', id: null },
                detail: [{
                    medicineId: inventory.medicineId,
                    medicationSnapshot: { name: medicine.name, concentration: medicine.concentration },
                    batch: lote.batch,
                    quantity: stock,
                    boxes,
                    blisters,
                    units,
                    expirationDate: lote.expirationDate,
                }],
                status: 'APLICADO',
                userId,
                appliedAt: new Date(),
            });

            movimientos.push(movimiento);
        }

        inventory.lots = [];
        inventory.totalStock = 0;
        await inventory.save();
    }

    return movimientos;
}
