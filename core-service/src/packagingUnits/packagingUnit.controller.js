import {
  createPackagingUnitRecord,
  getAllPackagingUnits,
  getPackagingUnitById,
  updatePackagingUnitRecord,
  deletePackagingUnitRecord,
} from "./packagingUnit.service.js";
import { successResponse } from "../utils/response.js";
import { handleServiceError } from "../utils/errorHandler.js";
import { registerAudit } from "../modules/audit/audit.service.js";
import { AUDIT_ACTIONS, AUDIT_MODULES } from "../modules/audit/audit.constants.js";
import { AUDIT_MESSAGES } from "../modules/audit/audit.messages.js";

export const createPackagingUnit = async (request, reply) => {
  try {
    const unit = await createPackagingUnitRecord(request.body);
    await registerAudit({
      userId: request.user?.id || "system",
      action: AUDIT_ACTIONS.CREAR,
      module: AUDIT_MODULES.PACKAGING_UNITS,
      reference: unit?._id?.toString() || "",
      description: AUDIT_MESSAGES.UNIDAD_EMPAQUETADO_CREADA,
    });
    return successResponse(reply, {
      message: "Unidad de empaquetado creada exitosamente",
      data: unit,
      statusCode: 201,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const getPackagingUnits = async (request, reply) => {
  try {
    const units = await getAllPackagingUnits();
    return successResponse(reply, {
      message: "Unidades de empaquetado obtenidas exitosamente",
      data: units,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const getPackagingUnit = async (request, reply) => {
  try {
    const unit = await getPackagingUnitById(request.params.id);
    return successResponse(reply, {
      message: "Unidad de empaquetado obtenida exitosamente",
      data: unit,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const updatePackagingUnit = async (request, reply) => {
  try {
    const unit = await updatePackagingUnitRecord(request.params.id, request.body);
    await registerAudit({
      userId: request.user?.id || "system",
      action: AUDIT_ACTIONS.ACTUALIZAR,
      module: AUDIT_MODULES.PACKAGING_UNITS,
      reference: unit?._id?.toString() || request.params.id,
      description: AUDIT_MESSAGES.UNIDAD_EMPAQUETADO_ACTUALIZADA,
    });
    return successResponse(reply, {
      message: "Unidad de empaquetado actualizada exitosamente",
      data: unit,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const deletePackagingUnit = async (request, reply) => {
  try {
    const unit = await deletePackagingUnitRecord(request.params.id);
    await registerAudit({
      userId: request.user?.id || "system",
      action: AUDIT_ACTIONS.ELIMINAR,
      module: AUDIT_MODULES.PACKAGING_UNITS,
      reference: request.params.id,
      description: AUDIT_MESSAGES.UNIDAD_EMPAQUETADO_ELIMINADA,
    });
    return successResponse(reply, {
      message: "Unidad de empaquetado eliminada exitosamente",
      data: unit,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};
