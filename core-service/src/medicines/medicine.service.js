import Medicine from "./medicine.model.js";
import Category from "../categories/category.model.js";
import { NotFoundError, ValidationError } from "../utils/errorHandler.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function assertCategoryExists(categoryName) {
  if (!categoryName || !categoryName.trim()) {
    throw new ValidationError("La categoría es requerida");
  }

  const category = await Category.findOne({
    name: { $regex: `^${escapeRegex(categoryName.trim())}$`, $options: "i" },
    status: "ACTIVO",
  });

  if (!category) {
    throw new ValidationError(
      `La categoría "${categoryName.trim()}" no existe. Selecciona una categoría creada por el sistema.`,
    );
  }

  return category;
}

function normalizeMedicineData(data) {
  const normalized = { ...data };

  if (normalized.minimumUnit === undefined && normalized.presentation !== undefined) {
    normalized.minimumUnit = normalized.presentation;
  }
  if (normalized.packageUnit === undefined && normalized.unitOfMeasure !== undefined) {
    normalized.packageUnit = normalized.unitOfMeasure;
  }

  if (normalized.presentation === undefined && normalized.minimumUnit !== undefined) {
    normalized.presentation = normalized.minimumUnit;
  }
  if (normalized.unitOfMeasure === undefined && normalized.packageUnit !== undefined) {
    normalized.unitOfMeasure = normalized.packageUnit;
  }

  for (const field of [
    "barcode",
    "name",
    "compound",
    "concentration",
    "presentation",
    "unitOfMeasure",
    "minimumUnit",
    "packageUnit",
    "category",
  ]) {
    if (typeof normalized[field] === "string") {
      normalized[field] = normalized[field].trim();
    }
  }

  if (normalized.barcode === "") {
    normalized.barcode = null;
  }

  if (normalized.intermediateUnit === "") {
    normalized.intermediateUnit = null;
  }

  if (normalized.unitsPerPackage !== undefined && normalized.unitsPerPackage !== "") {
    normalized.unitsPerPackage = Number(normalized.unitsPerPackage);
  }
  if (normalized.unitsPerMinimumUnit !== undefined && normalized.unitsPerMinimumUnit !== "") {
    normalized.unitsPerMinimumUnit = Number(normalized.unitsPerMinimumUnit);
  }
  if (normalized.minimumStock !== undefined && normalized.minimumStock !== "") {
    normalized.minimumStock = Number(normalized.minimumStock);
  }

  return normalized;
}

async function assertUniqueMedicine({ name, barcode, excludeId = null }) {
  const conditions = [];

  if (name) {
    conditions.push({
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    });
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
    throw new ValidationError("Ya existe un medicamento con ese nombre");
  }

  if (barcode && existing.barcode === barcode) {
    throw new ValidationError(
      "Ya existe un medicamento con ese codigo de barras",
    );
  }
}

export const createMedicineRecord = async (medicineData) => {
  const normalizedData = normalizeMedicineData(medicineData);
  const category = await assertCategoryExists(normalizedData.category);
  normalizedData.category = category.name;
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

  if (normalizedData.category) {
    const category = await assertCategoryExists(normalizedData.category);
    normalizedData.category = category.name;
  }

  await assertUniqueMedicine({
    name: normalizedData.name,
    barcode: normalizedData.barcode,
    excludeId: id,
  });

  const medicine = await Medicine.findByIdAndUpdate(
    id,
    { $set: normalizedData },
    { new: true, runValidators: true },
  );

  if (!medicine)
    throw new NotFoundError(`Medicamento con id ${id} no encontrado`);
  return medicine;
};

export const toggleMedicineStatusRecord = async (id, status) => {
  const medicine = await Medicine.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true },
  );

  if (!medicine)
    throw new NotFoundError(`Medicamento con id ${id} no encontrado`);
  return medicine;
};
