import {
  createPackagingUnitRecord,
  getAllPackagingUnits,
  getPackagingUnitById,
  updatePackagingUnitRecord,
  deletePackagingUnitRecord,
} from "./packagingUnit.service.js";
import { successResponse } from "../utils/response.js";
import { handleServiceError } from "../utils/errorHandler.js";

export const createPackagingUnit = async (request, reply) => {
  try {
    const unit = await createPackagingUnitRecord(request.body);
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
    return successResponse(reply, {
      message: "Unidad de empaquetado eliminada exitosamente",
      data: unit,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};
