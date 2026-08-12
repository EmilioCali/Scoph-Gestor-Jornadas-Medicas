import {
  createMeasureUnitRecord,
  getAllMeasureUnits,
  getMeasureUnitById,
  updateMeasureUnitRecord,
  deleteMeasureUnitRecord,
} from "./measureUnit.service.js";
import { successResponse } from "../utils/response.js";
import { handleServiceError } from "../utils/errorHandler.js";
import { registerAudit } from "../modules/audit/audit.service.js";
import { AUDIT_ACTIONS, AUDIT_MODULES } from "../modules/audit/audit.constants.js";
import { AUDIT_MESSAGES } from "../modules/audit/audit.messages.js";

export const createMeasureUnit = async (request, reply) => {
  try {
    const unit = await createMeasureUnitRecord(request.body);
    await registerAudit({
      userId: request.user?.id || "system",
      action: AUDIT_ACTIONS.CREAR,
      module: AUDIT_MODULES.MEASURE_UNITS,
      reference: unit?._id?.toString() || "",
      description: AUDIT_MESSAGES.UNIDAD_MEDIDA_CREADA,
    });
    return successResponse(reply, {
      message: "Unidad de medida creada exitosamente",
      data: unit,
      statusCode: 201,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const getMeasureUnits = async (request, reply) => {
  try {
    const units = await getAllMeasureUnits();
    return successResponse(reply, {
      message: "Unidades de medida obtenidas exitosamente",
      data: units,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const getMeasureUnit = async (request, reply) => {
  try {
    const unit = await getMeasureUnitById(request.params.id);
    return successResponse(reply, {
      message: "Unidad de medida obtenida exitosamente",
      data: unit,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const updateMeasureUnit = async (request, reply) => {
  try {
    const unit = await updateMeasureUnitRecord(request.params.id, request.body);
    await registerAudit({
      userId: request.user?.id || "system",
      action: AUDIT_ACTIONS.ACTUALIZAR,
      module: AUDIT_MODULES.MEASURE_UNITS,
      reference: unit?._id?.toString() || request.params.id,
      description: AUDIT_MESSAGES.UNIDAD_MEDIDA_ACTUALIZADA,
    });
    return successResponse(reply, {
      message: "Unidad de medida actualizada exitosamente",
      data: unit,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const deleteMeasureUnit = async (request, reply) => {
  try {
    const unit = await deleteMeasureUnitRecord(request.params.id);
    await registerAudit({
      userId: request.user?.id || "system",
      action: AUDIT_ACTIONS.ELIMINAR,
      module: AUDIT_MODULES.MEASURE_UNITS,
      reference: request.params.id,
      description: AUDIT_MESSAGES.UNIDAD_MEDIDA_ELIMINADA,
    });
    return successResponse(reply, {
      message: "Unidad de medida eliminada exitosamente",
      data: unit,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};
