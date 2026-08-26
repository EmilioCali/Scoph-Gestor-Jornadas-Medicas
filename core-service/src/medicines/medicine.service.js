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

async function assertCategoriesExist(categoryNames) {
  const categories = Array.isArray(categoryNames) ? categoryNames : [categoryNames];
  if (!categories.length) {
    throw new ValidationError("Debes seleccionar al menos una categoría");
  }

  const validCategories = [];
  for (const categoryName of categories) {
    const category = await assertCategoryExists(categoryName);
    if (!validCategories.some((name) => name.toLowerCase() === category.name.toLowerCase())) {
      validCategories.push(category.name);
    }
  }

  return validCategories;
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
  ]) {
    if (typeof normalized[field] === "string") {
      normalized[field] = normalized[field].trim();
    }
  }

  if (normalized.category !== undefined) {
    normalized.category = Array.isArray(normalized.category)
      ? normalized.category.map((category) => String(category).trim()).filter(Boolean)
      : [String(normalized.category).trim()].filter(Boolean);
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

function assertValidUnitHierarchy(medicine) {
  const minimumUnit = String(medicine.minimumUnit ?? "").trim().toLocaleLowerCase();
  const intermediateUnit = String(medicine.intermediateUnit ?? "").trim().toLocaleLowerCase();

  if (intermediateUnit && intermediateUnit === minimumUnit) {
    throw new ValidationError(
      "La unidad intermedia debe ser distinta de la unidad mínima. Usa 'Sin unidad intermedia' si el empaque contiene directamente unidades mínimas.",
    );
  }

  if (!intermediateUnit) {
    medicine.unitsPerMinimumUnit = 1;
  }
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
  assertValidUnitHierarchy(normalizedData);
  normalizedData.category = await assertCategoriesExist(normalizedData.category);
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
  const currentMedicine = await Medicine.findById(id);
  if (!currentMedicine)
    throw new NotFoundError(`Medicamento con id ${id} no encontrado`);

  const completeMedicine = { ...currentMedicine.toObject(), ...normalizedData };
  assertValidUnitHierarchy(completeMedicine);
  if (!completeMedicine.intermediateUnit) {
    normalizedData.unitsPerMinimumUnit = 1;
  }

  if (normalizedData.category !== undefined) {
    normalizedData.category = await assertCategoriesExist(normalizedData.category);
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
