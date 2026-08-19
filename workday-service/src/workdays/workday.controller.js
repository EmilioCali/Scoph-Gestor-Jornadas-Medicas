import axios from "axios";
import Workday from "./workday.model.js";
import { badRequest, handleServiceError } from "../utils/errorHandler.js";
import { successResponse } from "../utils/response.js";

async function registerAuditEvent(payload, request) {
  const coreServiceUrl = process.env.CORE_SERVICE_URL || "http://localhost:3001";
  try {
    await fetch(`${coreServiceUrl}/api/v1/auditoria`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.authorization || "",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("No se pudo registrar auditoría para workday-service", error);
  }
}

function assertValidDateRange(startDate, endDate) {
  if (!startDate || !endDate) return;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw badRequest("Las fechas de la jornada no son validas");
  }

  if (start > end) {
    throw badRequest(
      "La fecha de inicio no puede ser posterior a la fecha de finalizacion",
    );
  }
}

const WORKDAY_TIMEZONE = process.env.WORKDAY_TIMEZONE || "America/Guatemala";

function getTodayCalendarDate(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WORKDAY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date(date))
    .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getWorkdayCalendarDate(date) {
  // Las jornadas son eventos de día completo. Se conserva la parte YYYY-MM-DD
  // enviada por el formulario, sin desplazarla al convertir a otra zona horaria.
  return new Date(date).toISOString().slice(0, 10);
}

export function getAutomaticWorkdayStatus(workday, now = new Date()) {
  const today = getTodayCalendarDate(now);
  const startDate = getWorkdayCalendarDate(workday.startDate);
  const endDate = getWorkdayCalendarDate(workday.endDate);

  if (endDate < today) return "FINISHED";
  if (startDate <= today && today <= endDate) return "IN_PROGRESS";
  return "PLANNED";
}

async function returnRemainingInventory(workdayId, userId, authorization) {
  const coreServiceUrl = process.env.CORE_SERVICE_URL || "http://localhost:3022";
  await axios.post(
    `${coreServiceUrl}/api/v1/movimientos/retorno-automatico-jornada`,
    { workdayId, userId },
    { headers: { Authorization: authorization || "" } },
  );
}

export async function synchronizeWorkdayStatuses({ authorization, userId = "system" } = {}) {
  const workdays = await Workday.find({
    status: { $in: ["PLANNED", "IN_PROGRESS"] },
  });
  const synchronized = [];

  for (const workday of workdays) {
    const nextStatus = getAutomaticWorkdayStatus(workday);
    if (nextStatus === workday.status) continue;

    // El retorno debe completarse antes de cerrar la jornada. Si Core falla,
    // queda IN_PROGRESS y se reintenta en la siguiente sincronización.
    if (nextStatus === "FINISHED") {
      await returnRemainingInventory(workday._id.toString(), userId, authorization);
    }

    workday.status = nextStatus;
    await workday.save();
    synchronized.push({ id: workday._id.toString(), status: nextStatus });
  }

  return synchronized;
}

/**
 * Normaliza y valida el arreglo de médicos asignados.
 * Deduplica por userId preservando el primer nombre encontrado.
 */
function normalizeDoctors(doctors) {
  if (doctors === undefined || doctors === null) {
    return [];
  }

  if (!Array.isArray(doctors)) {
    throw badRequest("doctors debe ser un arreglo");
  }

  const seen = new Set();
  const normalized = [];

  for (const doctor of doctors) {
    const userId = doctor?.userId != null ? String(doctor.userId).trim() : "";
    const name = doctor?.name != null ? String(doctor.name).trim() : "";

    if (!userId || !name) {
      throw badRequest("Cada médico asignado requiere userId y name");
    }

    if (seen.has(userId)) continue;
    seen.add(userId);
    normalized.push({ userId, name });
  }

  return normalized;
}

function isDoctorAssigned(workday, userId) {
  if (!workday || userId == null) return false;
  return (workday.doctors || []).some(
    (doctor) => String(doctor.userId) === String(userId),
  );
}

function forbiddenAccess(
  reply,
  message = "No tienes permiso para acceder a esta jornada",
) {
  return reply.status(403).send({
    success: false,
    message,
    error: "FORBIDDEN",
  });
}

export const createWorkday = async (request, reply) => {
  try {
    assertValidDateRange(request.body.startDate, request.body.endDate);

    const doctors = normalizeDoctors(request.body.doctors);
    const companions = Array.isArray(request.body.companions)
      ? request.body.companions
          .map((name) => String(name ?? "").trim())
          .filter(Boolean)
      : [];

    const manager = {
      userId: request.body.manager?.userId
        ? String(request.body.manager.userId).trim()
        : undefined,
      name: String(
        request.body.manager?.name ?? request.user?.username ?? "",
      ).trim(),
    };

    if (!manager.name) {
      throw badRequest("El nombre del responsable es requerido");
    }

    const workdayData = {
      ...request.body,
      manager,
      doctors,
      companions,
    };

    const workday = await Workday.create(workdayData);
    await registerAuditEvent(
      {
        userId: request.user?.id || request.user?.sub || request.user?.username || "system",
        action: "CREAR",
        module: "WORKDAYS",
        reference: workday._id?.toString() || "",
        description: "Jornada creada",
      },
      request,
    );

    return successResponse(reply, {
      message: "Jornada creada exitosamente",
      data: workday,
      statusCode: 201,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const getWorkdays = async (request, reply) => {
  try {
    try {
      const authorization = `Bearer ${request.server.jwt.sign(
        { id: "system", username: "system", rol: "SUPER_ADMIN" },
        { expiresIn: "5m" },
      )}`;
      await synchronizeWorkdayStatuses({ authorization });
    } catch (error) {
      // Consultar jornadas debe seguir siendo posible aunque Core esté
      // temporalmente fuera de servicio; el proceso programado lo reintentará.
      request.log.error(error, "No se pudieron sincronizar las jornadas");
    }
    const filter = {};

    // TKT-79: el médico solo ve jornadas donde está asignado
    if (request.user?.rol === "MEDICO") {
      filter["doctors.userId"] = request.user.id;
    }

    const workdays = await Workday.find(filter).sort({ startDate: -1 });

    return successResponse(reply, {
      message: "Jornadas obtenidas exitosamente",
      data: workdays,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const getWorkdayById = async (request, reply) => {
  try {
    const workday = await Workday.findById(request.params.id);

    if (!workday) {
      return reply.status(404).send({
        success: false,
        message: "Jornada no encontrada",
        error: "NOT_FOUND",
      });
    }

    // TKT-80: bloquear acceso por URL si el médico no está asignado
    if (
      request.user?.rol === "MEDICO" &&
      !isDoctorAssigned(workday, request.user.id)
    ) {
      return forbiddenAccess(reply);
    }

    return successResponse(reply, {
      message: "Jornada obtenida exitosamente",
      data: workday,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const updateWorkday = async (request, reply) => {
  try {
    const currentWorkday = await Workday.findById(request.params.id);

    if (!currentWorkday) {
      return reply.status(404).send({
        success: false,
        message: "Jornada no encontrada",
        error: "NOT_FOUND",
      });
    }

    // status tiene su propio endpoint — se ignora aquí
    const { status, manager, doctors, companions, ...rest } = request.body;
    assertValidDateRange(
      rest.startDate ?? currentWorkday.startDate,
      rest.endDate ?? currentWorkday.endDate,
    );

    // Dot notation para no pisar manager.userId
    const updateFields = { ...rest };
    if (manager?.name) updateFields["manager.name"] = manager.name;
    if (manager?.userId) updateFields["manager.userId"] = manager.userId;
    if (doctors !== undefined) {
      updateFields.doctors = normalizeDoctors(doctors);
    }
    if (companions !== undefined) {
      updateFields.companions = Array.isArray(companions)
        ? companions.map((name) => String(name ?? "").trim()).filter(Boolean)
        : [];
    }

    const workday = await Workday.findByIdAndUpdate(
      request.params.id,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!workday) {
      return reply.status(404).send({
        success: false,
        message: "Jornada no encontrada",
        error: "NOT_FOUND",
      });
    }

    await registerAuditEvent(
      {
        userId: request.user?.id || request.user?.sub || request.user?.username || "system",
        action: "ACTUALIZAR",
        module: "WORKDAYS",
        reference: workday._id?.toString() || request.params.id,
        description: "Jornada actualizada",
      },
      request,
    );

    return successResponse(reply, {
      message: "Jornada actualizada exitosamente",
      data: workday,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const updateWorkdayDoctors = async (request, reply) => {
  try {
    const doctors = normalizeDoctors(request.body.doctors);
    const workday = await Workday.findByIdAndUpdate(
      request.params.id,
      { $set: { doctors } },
      { new: true, runValidators: true },
    );

    if (!workday) {
      return reply.status(404).send({
        success: false,
        message: "Jornada no encontrada",
        error: "NOT_FOUND",
      });
    }

    await registerAuditEvent(
      {
        userId: request.user?.id || request.user?.sub || request.user?.username || "system",
        action: "ACTUALIZAR",
        module: "WORKDAYS",
        reference: workday._id?.toString() || request.params.id,
        description: "Médicos asignados a jornada actualizados",
      },
      request,
    );

    return successResponse(reply, {
      message: "Médicos asignados a la jornada correctamente",
      data: workday,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const updateWorkdayStatus = async (request, reply) => {
  try {
    const { status } = request.body;
    const currentWorkday = await Workday.findById(request.params.id);

    if (!currentWorkday) {
      return reply.status(404).send({
        success: false,
        message: "Jornada no encontrada",
        error: "NOT_FOUND",
      });
    }

    const shouldAutoReturn = currentWorkday.status !== "FINISHED" && status === "FINISHED";

    if (shouldAutoReturn) {
      await returnRemainingInventory(
        request.params.id,
        request.user?.id || request.user?.sub || request.user?.username || "system",
        request.headers.authorization,
      );
    }

    const workday = await Workday.findByIdAndUpdate(
      request.params.id,
      { $set: { status } },
      { new: true },
    );

    if (!workday) {
      return reply.status(404).send({
        success: false,
        message: "Jornada no encontrada",
        error: "NOT_FOUND",
      });
    }

    await registerAuditEvent(
      {
        userId: request.user?.id || request.user?.sub || request.user?.username || "system",
        action: "ACTUALIZAR",
        module: "WORKDAYS",
        reference: workday._id?.toString() || request.params.id,
        description: `Estado de jornada actualizado a ${status}`,
      },
      request,
    );

    return successResponse(reply, {
      message: `Estado de jornada actualizado a ${status}`,
      data: workday,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};

export const deleteWorkday = async (request, reply) => {
  try {
    const workday = await Workday.findByIdAndDelete(request.params.id);

    if (!workday) {
      return reply.status(404).send({
        success: false,
        message: "Jornada no encontrada",
        error: "NOT_FOUND",
      });
    }

    await registerAuditEvent(
      {
        userId: request.user?.id || request.user?.sub || request.user?.username || "system",
        action: "ELIMINAR",
        module: "WORKDAYS",
        reference: workday._id?.toString() || request.params.id,
        description: "Jornada eliminada",
      },
      request,
    );

    return successResponse(reply, {
      message: "Jornada eliminada exitosamente",
      data: workday,
      statusCode: 200,
    });
  } catch (error) {
    return handleServiceError(error, reply);
  }
};
