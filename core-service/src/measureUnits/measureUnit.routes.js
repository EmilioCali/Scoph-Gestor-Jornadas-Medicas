import {
  createMeasureUnit,
  getMeasureUnits,
  getMeasureUnit,
  updateMeasureUnit,
  deleteMeasureUnit,
} from "./measureUnit.controller.js";
import { requireRole } from "../middlewares/authenticate.js";

const ADMINISTRATIVE_ROLES = ["ADMIN", "SUPER_ADMIN"];
const SUPER_ADMIN_ONLY = ["SUPER_ADMIN"];

const measureUnitSchema = {
  type: "object",
  properties: {
    _id: { type: "string", example: "664f1a2b3c4d5e6f78901234" },
    name: { type: "string", example: "Tableta" },
    description: { type: "string", example: "Unidad física base" },
    activo: { type: "boolean", example: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const measureUnitRoutes = async (fastify) => {
  fastify.post(
    "/measure-units",
    {
      preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
      schema: {
        tags: ["Unidades de Medida"],
        summary: "Crear unidad de medida",
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Tableta" },
            description: { type: "string", example: "Unidad física base" },
            activo: { type: "boolean", example: true },
          },
        },
        response: {
          201: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: measureUnitSchema } },
        },
      },
    },
    createMeasureUnit,
  );

  fastify.get(
    "/measure-units",
    {
      preHandler: [requireRole(...ADMINISTRATIVE_ROLES)],
      schema: {
        tags: ["Unidades de Medida"],
        summary: "Listar unidades de medida",
        response: {
          200: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "array", items: measureUnitSchema } } },
        },
      },
    },
    getMeasureUnits,
  );

  fastify.get(
    "/measure-units/:id",
    {
      preHandler: [requireRole(...ADMINISTRATIVE_ROLES)],
      schema: {
        tags: ["Unidades de Medida"],
        summary: "Obtener unidad de medida",
        params: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
        response: {
          200: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: measureUnitSchema } },
        },
      },
    },
    getMeasureUnit,
  );

  fastify.put(
    "/measure-units/:id",
    {
      preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
      schema: {
        tags: ["Unidades de Medida"],
        summary: "Actualizar unidad de medida",
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
          200: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: measureUnitSchema } },
        },
      },
    },
    updateMeasureUnit,
  );

  fastify.delete(
    "/measure-units/:id",
    {
      preHandler: [requireRole(...SUPER_ADMIN_ONLY)],
      schema: {
        tags: ["Unidades de Medida"],
        summary: "Eliminar unidad de medida",
        params: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
        response: {
          200: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: measureUnitSchema } },
        },
      },
    },
    deleteMeasureUnit,
  );
};

export default measureUnitRoutes;
