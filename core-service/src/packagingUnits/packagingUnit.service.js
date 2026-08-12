import PackagingUnit from "./packagingUnit.model.js";
import { NotFoundError, ValidationError } from "../utils/errorHandler.js";

function normalizeName(value) {
  return (value || "").trim();
}

async function assertUniquePackagingUnitName(name, excludeId = null) {
  const trimmedName = normalizeName(name);
  if (!trimmedName) {
    throw new ValidationError("El nombre de la unidad de empaquetado es requerido");
  }

  const existing = await PackagingUnit.findOne({
    name: { $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

  if (existing) {
    throw new ValidationError(`Ya existe la unidad de empaquetado "${existing.name}"`);
  }
}

export async function createPackagingUnitRecord(data) {
  const payload = {
    name: normalizeName(data?.name),
    description: (data?.description || "").trim(),
    activo: data?.activo ?? true,
  };

  await assertUniquePackagingUnitName(payload.name);
  return PackagingUnit.create(payload);
}

export async function getAllPackagingUnits() {
  return PackagingUnit.find().sort({ name: 1 }).lean();
}

export async function getPackagingUnitById(id) {
  const unit = await PackagingUnit.findById(id);
  if (!unit) {
    throw new NotFoundError("Unidad de empaquetado no encontrada");
  }
  return unit;
}

export async function updatePackagingUnitRecord(id, data) {
  const payload = { ...data };

  if (payload.name !== undefined) {
    payload.name = normalizeName(payload.name);
    await assertUniquePackagingUnitName(payload.name, id);
  }

  if (payload.description !== undefined) {
    payload.description = payload.description.trim();
  }

  const unit = await PackagingUnit.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!unit) {
    throw new NotFoundError("Unidad de empaquetado no encontrada");
  }

  return unit;
}

export async function deletePackagingUnitRecord(id) {
  const unit = await PackagingUnit.findByIdAndDelete(id);
  if (!unit) {
    throw new NotFoundError("Unidad de empaquetado no encontrada");
  }
  return unit;
}
