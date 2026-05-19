import Medicine from './medicine.model.js';

export const createMedicineRecord = async (medicineData) => {
    const medicine = new Medicine(medicineData);
    return await medicine.save();
};

export const getAllMedicines = async () => {
    return await Medicine.find({ status: 'ACTIVO' });
};