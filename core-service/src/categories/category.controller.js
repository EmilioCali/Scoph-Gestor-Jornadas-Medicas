import {
  createCategoryRecord,
  getAllCategories,
  getCategoryById,
  updateCategoryRecord,
  deleteCategoryRecord,
} from "./category.service.js";
import { successResponse } from "../utils/response.js";
import { handleServiceError } from "../utils/errorHandler.js";

export const createCategory = async (request, reply) => {
  try {
    const category = await createCategoryRecord(request.body);
    return successResponse(reply, {
      message: "Categoría creada exitosamente",
      data: category,
      statusCode: 201,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const getCategories = async (request, reply) => {
  try {
    const categories = await getAllCategories();
    return successResponse(reply, {
      message: "Categorías obtenidas exitosamente",
      data: categories,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const getCategory = async (request, reply) => {
  try {
    const category = await getCategoryById(request.params.id);
    return successResponse(reply, {
      message: "Categoría obtenida exitosamente",
      data: category,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const updateCategory = async (request, reply) => {
  try {
    const category = await updateCategoryRecord(
      request.params.id,
      request.body,
    );
    return successResponse(reply, {
      message: "Categoría actualizada exitosamente",
      data: category,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const deleteCategory = async (request, reply) => {
  try {
    const category = await deleteCategoryRecord(request.params.id);
    return successResponse(reply, {
      message: "Categoría eliminada exitosamente",
      data: category,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};
