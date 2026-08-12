import MeasureUnit from "./measureUnit.model.js";
import { NotFoundError, ValidationError } from "../utils/errorHandler.js";

function normalizeName(value) {
  return (value || "").trim();
}

async function assertUniqueMeasureUnitName(name, excludeId = null) {
  const trimmedName = normalizeName(name);
  if (!trimmedName) {
    throw new ValidationError("El nombre de la unidad es requerido");
  }

  const existing = await MeasureUnit.findOne({
    name: { $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

  if (existing) {
    throw new ValidationError(`Ya existe la unidad "${existing.name}"`);
  }
}

export async function createMeasureUnitRecord(data) {
  const payload = {
    name: normalizeName(data?.name),
    description: (data?.description || "").trim(),
    activo: data?.activo ?? true,
  };

  await assertUniqueMeasureUnitName(payload.name);
  return MeasureUnit.create(payload);
}

export async function getAllMeasureUnits() {
  return MeasureUnit.find().sort({ name: 1 }).lean();
}

export async function getMeasureUnitById(id) {
  const unit = await MeasureUnit.findById(id);
  if (!unit) {
    throw new NotFoundError("Unidad de medida no encontrada");
  }
  return unit;
}

export async function updateMeasureUnitRecord(id, data) {
  const payload = { ...data };

  if (payload.name !== undefined) {
    payload.name = normalizeName(payload.name);
    await assertUniqueMeasureUnitName(payload.name, id);
  }

  if (payload.description !== undefined) {
    payload.description = payload.description.trim();
  }

  const unit = await MeasureUnit.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!unit) {
    throw new NotFoundError("Unidad de medida no encontrada");
  }

  return unit;
}

export async function deleteMeasureUnitRecord(id) {
  const unit = await MeasureUnit.findByIdAndDelete(id);
  if (!unit) {
    throw new NotFoundError("Unidad de medida no encontrada");
  }
  return unit;
}
