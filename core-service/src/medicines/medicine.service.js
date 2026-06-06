import Medicine from './medicine.model.js';
import { NotFoundError } from '../utils/errorHandler.js';

export const createMedicineRecord = async (medicineData) => {
    const medicine = new Medicine(medicineData);
    return await medicine.save();
};

export const getAllMedicines = async () => {
    return await Medicine.find().sort({ name: 1 });
};

export const updateMedicineRecord = async (id, updateData) => {
    const { status, ...safeData } = updateData;

    const medicine = await Medicine.findByIdAndUpdate(
        id,
        { $set: safeData },
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