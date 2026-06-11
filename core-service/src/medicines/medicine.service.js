import Medicine from './medicine.model.js';
import { NotFoundError, ValidationError } from '../utils/errorHandler.js';

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeMedicineData(data) {
    const normalized = { ...data };

    for (const field of ['barcode', 'name', 'compound', 'concentration', 'presentation', 'unitOfMeasure', 'category']) {
        if (typeof normalized[field] === 'string') {
            normalized[field] = normalized[field].trim();
        }
    }

    if (normalized.barcode === '') {
        normalized.barcode = null;
    }

    return normalized;
}

async function assertUniqueMedicine({ name, barcode, excludeId = null }) {
    const conditions = [];

    if (name) {
        conditions.push({ name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } });
    }

    if (barcode) {
        conditions.push({ barcode });
    }

    if (conditions.length === 0) return;

    const query = { $or: conditions };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const existing = await Medicine.findOne(query);
    if (!existing) return;

    if (name && existing.name.toLowerCase() === name.toLowerCase()) {
        throw new ValidationError('Ya existe un medicamento con ese nombre');
    }

    if (barcode && existing.barcode === barcode) {
        throw new ValidationError('Ya existe un medicamento con ese codigo de barras');
    }
}

export const createMedicineRecord = async (medicineData) => {
    const normalizedData = normalizeMedicineData(medicineData);
    await assertUniqueMedicine(normalizedData);

    const medicine = new Medicine(normalizedData);
    return await medicine.save();
};

export const getAllMedicines = async () => {
    return await Medicine.find().sort({ name: 1 });
};

export const updateMedicineRecord = async (id, updateData) => {
    const { status, ...safeData } = updateData;
    const normalizedData = normalizeMedicineData(safeData);

    await assertUniqueMedicine({
        name: normalizedData.name,
        barcode: normalizedData.barcode,
        excludeId: id
    });

    const medicine = await Medicine.findByIdAndUpdate(
        id,
        { $set: normalizedData },
        { new: true, runValidators: true }
    );

    if (!medicine) throw new NotFoundError(`Medicamento con id ${id} no encontrado`);
    return medicine;
};

export const toggleMedicineStatusRecord = async (id, status) => {
    const medicine = await Medicine.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
    );

    if (!medicine) throw new NotFoundError(`Medicamento con id ${id} no encontrado`);
    return medicine;
};
