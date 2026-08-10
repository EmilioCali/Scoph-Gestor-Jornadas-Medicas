import {
  createPackagingUnit,
  getPackagingUnits,
  getPackagingUnit,
  updatePackagingUnit,
  deletePackagingUnit,
} from "./packagingUnit.controller.js";
import { requireRole } from "../middlewares/authenticate.js";

const ADMINISTRATIVE_ROLES = ["ADMIN", "SUPER_ADMIN"];
const SUPER_ADMIN_ONLY = ["SUPER_ADMIN"];

const packagingUnitSchema = {
  type: "object",
  properties: {
    _id: { type: "string", example: "664f1a2b3c4d5e6f78901234" },
    name: { type: "string", example: "Caja" },
    description: { type: "string", example: "Unidad de empaque por caja" },
    activo: { type: "boolean", example: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const packagingUnitRoutes = async (fastify) => {
  fastify.post(
    "/packaging-units",
    {
      preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
      schema: {
        tags: ["Unidades de Empaquetado"],
        summary: "Crear unidad de empaquetado",
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Caja" },
            description: { type: "string", example: "Unidad de empaque por caja" },
            activo: { type: "boolean", example: true },
          },
        },
        response: {
          201: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: packagingUnitSchema } },
        },
      },
    },
    createPackagingUnit,
  );

  fastify.get(
    "/packaging-units",
    {
      preHandler: [requireRole(...ADMINISTRATIVE_ROLES)],
      schema: {
        tags: ["Unidades de Empaquetado"],
        summary: "Listar unidades de empaquetado",
        response: {
          200: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "array", items: packagingUnitSchema } } },
        },
      },
    },
    getPackagingUnits,
  );

  fastify.get(
    "/packaging-units/:id",
    {
      preHandler: [requireRole(...ADMINISTRATIVE_ROLES)],
      schema: {
        tags: ["Unidades de Empaquetado"],
        summary: "Obtener unidad de empaquetado",
        params: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
        response: {
          200: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: packagingUnitSchema } },
        },
      },
    },
    getPackagingUnit,
  );

  fastify.put(
    "/packaging-units/:id",
    {
      preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
      schema: {
        tags: ["Unidades de Empaquetado"],
        summary: "Actualizar unidad de empaquetado",
        params: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            activo: { type: "boolean" },
          },
        },
        response: {
          200: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: packagingUnitSchema } },
        },
      },
    },
    updatePackagingUnit,
  );

  fastify.delete(
    "/packaging-units/:id",
    {
      preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
      schema: {
        tags: ["Unidades de Empaquetado"],
        summary: "Eliminar unidad de empaquetado",
        params: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
        response: {
          200: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: packagingUnitSchema } },
        },
      },
    },
    deletePackagingUnit,
  );
};

export default packagingUnitRoutes;
