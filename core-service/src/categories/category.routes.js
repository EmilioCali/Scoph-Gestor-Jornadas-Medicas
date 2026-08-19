import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";
import { requireRole } from "../middlewares/authenticate.js";

const ADMINISTRATIVE_ROLES = ["ADMIN", "SUPER_ADMIN"];
const SUPER_ADMIN_ONLY = ["SUPER_ADMIN"];

const categorySchema = {
  type: "object",
  properties: {
    _id: { type: "string", example: "664f1a2b3c4d5e6f78901234" },
    name: { type: "string", example: "Analgesico" },
    description: {
      type: "string",
      example: "Medicamentos destinados a aliviar dolor.",
    },
    status: { type: "string", enum: ["ACTIVO", "INACTIVO"], example: "ACTIVO" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const validationErrorSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Error en la solicitud" },
    error: { type: "string", example: "VALIDATION_ERROR" },
  },
};

const serverErrorSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Error interno del servidor" },
    error: { type: "string", example: "BAD_REQUEST" },
  },
};

const categoryRoutes = async (fastify) => {
  fastify.post(
    "/categories",
    {
      preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
      schema: {
        tags: ["Categorías"],
        summary: "Crear categoría",
        description:
          "Registra una categoría de medicamentos. Solo SUPER_ADMIN puede crear.",
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Analgesico" },
            description: { type: "string", example: "Medicamentos para dolor" },
            status: {
              type: "string",
              enum: ["ACTIVO", "INACTIVO"],
              example: "ACTIVO",
            },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Categoría creada exitosamente",
              },
              data: categorySchema,
            },
          },
          400: validationErrorSchema,
        },
      },
    },
    createCategory,
  );

  fastify.get(
    "/categories",
    {
      preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
      schema: {
        tags: ["Categorías"],
        summary: "Listar categorías",
        description:
          "Retorna todas las categorías de medicamentos. ADMIN y SUPER_ADMIN pueden ver.",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Categorías obtenidas exitosamente",
              },
              data: { type: "array", items: categorySchema },
            },
          },
          500: serverErrorSchema,
        },
      },
    },
    getCategories,
  );

  fastify.get(
    "/categories/:id",
    {
      preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
      schema: {
        tags: ["Categorías"],
        summary: "Obtener categoría por ID",
        description:
          "Retorna una categoría por su identificador. ADMIN y SUPER_ADMIN pueden ver.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", example: "664f1a2b3c4d5e6f78901234" },
          },
        },
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Categoría obtenida exitosamente",
              },
              data: categorySchema,
            },
          },
          404: validationErrorSchema,
          500: serverErrorSchema,
        },
      },
    },
    getCategory,
  );

  fastify.put(
    "/categories/:id",
    {
      preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
      schema: {
        tags: ["Categorías"],
        summary: "Actualizar categoría",
        description:
          "Actualiza una categoría de medicamentos. Solo SUPER_ADMIN puede editar.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", example: "664f1a2b3c4d5e6f78901234" },
          },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string", example: "Analgésicos" },
            description: { type: "string", example: "Medicamentos para dolor" },
            status: {
              type: "string",
              enum: ["ACTIVO", "INACTIVO"],
              example: "ACTIVO",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Categoría actualizada exitosamente",
              },
              data: categorySchema,
            },
          },
          400: validationErrorSchema,
          404: validationErrorSchema,
          500: serverErrorSchema,
        },
      },
    },
    updateCategory,
  );

  fastify.delete(
    "/categories/:id",
    {
      preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
      schema: {
        tags: ["Categorías"],
        summary: "Eliminar categoría",
        description:
          "Elimina una categoría de medicamentos. Solo SUPER_ADMIN puede eliminar.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", example: "664f1a2b3c4d5e6f78901234" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Categoría eliminada exitosamente",
              },
              data: categorySchema,
            },
          },
          404: validationErrorSchema,
          500: serverErrorSchema,
        },
      },
    },
    deleteCategory,
  );
};

export default categoryRoutes;
