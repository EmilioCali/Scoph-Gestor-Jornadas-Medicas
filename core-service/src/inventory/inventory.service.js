import mongoose from 'mongoose';
import centralInventory from "./centralInventory.model.js";
import Movement from '../movements/movement.model.js'
import Medicine from '../medicines/medicine.model.js'
import WorkdayInventory from './workdayInventory.model.js';
import { getWorkdayById } from '../workdays/workday.client.js';
import { validarLoteExistente, validarNoVencido, validarStockPositivo } from "../utils/validator.js";

function normalizeLotData(item) {
    const boxes = Number(item.boxes || 0);
    const blisters = Number(item.blisters || 0);
    const units = Number(item.units || 0);
    const quantity = Number(item.quantity || 0);

    const totalUnits = boxes * 100 + blisters * 10 + units + quantity;

    return {
        boxes,
        blisters,
        units,
        quantity,
        totalUnits
    };
}

function addLotStock(lote, { boxes, blisters, units, quantity }) {
    lote.boxes = (Number(lote.boxes) || 0) + boxes;
    lote.blisters = (Number(lote.blisters) || 0) + blisters;
    lote.units = (Number(lote.units) || 0) + units;
    lote.stock = (Number(lote.stock) || 0) + quantity;
}

function getLotUnitValue(lote) {
    return ((Number(lote.boxes) || 0) * 100) + ((Number(lote.blisters) || 0) * 10) + (Number(lote.units) || 0) + (Number(lote.stock) || 0);
}

function subtractLotUnits(lote, amount) {
    let remaining = Math.max(0, Number(amount) || 0);

    const boxesToRemove = Math.min(Math.floor(remaining / 100), Number(lote.boxes) || 0);
    remaining -= boxesToRemove * 100;
    lote.boxes = Math.max(0, (Number(lote.boxes) || 0) - boxesToRemove);

    const blistersToRemove = Math.min(Math.floor(remaining / 10), Number(lote.blisters) || 0);
    remaining -= blistersToRemove * 10;
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
        const { boxes, blisters, units, quantity, totalUnits } = normalizeLotData(item);

        if (totalUnits <= 0) throw new Error("La cantidad debe de ser positiva");
        if (new Date(expirationDate) <= new Date()) throw new Error("La fecha de vencimiento debe de ser una futura");

        const med = await Medicine.findById(medicineId);
        if (!med) throw new Error("Medicamento no encontrado");

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
        const { boxes, blisters, units, quantity, totalUnits } = normalizeLotData(item);

        const med = await Medicine.findById(medicineId);
        if (!med) throw new Error("Medicamento no encontrado, lo siento");

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
        const { boxes, blisters, units, quantity, totalUnits } = normalizeLotData(item);

        const med = await Medicine.findById(medicineId);
        if (!med) throw new Error('Medicamento no encontrado');

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


export async function validarStockJornada(productoId, cantidad) {
    const inventory = await getWorkdayInventory(productoId);

    const ahora = new Date();
    const lote = inventory.lots.find(
        (l) => ((Number(l.boxes) || 0) * 100 + (Number(l.blisters) || 0) * 10 + (Number(l.units) || 0) + (Number(l.stock) || 0)) > 0 && new Date(l.expirationDate) >= ahora
    );

    validarLoteExistente(lote);
    validarNoVencido(lote.expirationDate);

    const disponible = getLotUnitValue(lote);
    if (disponible < cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${disponible}, solicitado: ${cantidad}`);
    }

    validarStockPositivo(disponible);

    return { inventory, lote };
}

export async function descontarStockJornada(productoId, cantidad) {
    const { inventory, lote } = await validarStockJornada(productoId, cantidad);

    subtractLotUnits(lote, cantidad);
    inventory.totalStock = Math.max(0, (Number(inventory.totalStock) || 0) - cantidad);

    await inventory.save();

    const medicine = await Medicine.findById(inventory.medicineId);
    if (!medicine) {
        throw new Error('Medicamento no encontrado');
    }

    return { inventory, lote, medicine };
}

export async function procesarRetornoJornada(productoId, cantidad) {
    const inventory = await getWorkdayInventory(productoId);
    validarLoteExistente(inventory);

    const lote = inventory.lots[0];
    validarLoteExistente(lote);
    validarNoVencido(lote.expirationDate);

    lote.stock = (Number(lote.stock) || 0) + cantidad;
    inventory.totalStock = (Number(inventory.totalStock) || 0) + cantidad;

    await inventory.save();

    const medicine = await Medicine.findById(inventory.medicineId);
    if (!medicine) {
        throw new Error('Medicamento no encontrado');
    }

    return { inventory, lote, medicine };
}
