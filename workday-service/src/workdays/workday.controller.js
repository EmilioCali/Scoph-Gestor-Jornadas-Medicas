import Workday from './workday.model.js';
import { badRequest, handleServiceError } from '../utils/errorHandler.js';
import { successResponse } from '../utils/response.js';

function assertValidDateRange(startDate, endDate) {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw badRequest('Las fechas de la jornada no son validas');
    }

    if (start > end) {
        throw badRequest('La fecha de inicio no puede ser posterior a la fecha de finalizacion');
    }
}

export const createWorkday = async (request, reply) => {
    try {
        assertValidDateRange(request.body.startDate, request.body.endDate);

        const workdayData = {
            ...request.body,
            manager: {
                userId: request.body.manager?.userId || request.user.id,
                name: request.body.manager?.name || request.user.username
            }
        };

        const workday = await Workday.create(workdayData);

        return successResponse(reply, {
            message: 'Jornada creada exitosamente',
            data: workday,
            statusCode: 201
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};

export const getWorkdays = async (request, reply) => {
    try {
        const workdays = await Workday.find().sort({ startDate: -1 });

        return successResponse(reply, {
            message: 'Jornadas obtenidas exitosamente',
            data: workdays,
            statusCode: 200
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
                message: 'Jornada no encontrada',
                error: 'NOT_FOUND'
            });
        }

        return successResponse(reply, {
            message: 'Jornada obtenida exitosamente',
            data: workday,
            statusCode: 200
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
                message: 'Jornada no encontrada',
                error: 'NOT_FOUND'
            });
        }

        // status tiene su propio endpoint — se ignora aquí
        const { status, manager, ...rest } = request.body;
        assertValidDateRange(
            rest.startDate ?? currentWorkday.startDate,
            rest.endDate ?? currentWorkday.endDate
        );

        // Dot notation para no pisar manager.userId
        const updateFields = { ...rest };
        if (manager?.name)   updateFields['manager.name']   = manager.name;
        if (manager?.userId) updateFields['manager.userId'] = manager.userId;

        const workday = await Workday.findByIdAndUpdate(
            request.params.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!workday) {
            return reply.status(404).send({
                success: false,
                message: 'Jornada no encontrada',
                error: 'NOT_FOUND'
            });
        }

        return successResponse(reply, {
            message: 'Jornada actualizada exitosamente',
            data: workday,
            statusCode: 200
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};

export const updateWorkdayStatus = async (request, reply) => {
    try {
        const { status } = request.body;

        const workday = await Workday.findByIdAndUpdate(
            request.params.id,
            { $set: { status } },
            { new: true }
        );

        if (!workday) {
            return reply.status(404).send({
                success: false,
                message: 'Jornada no encontrada',
                error: 'NOT_FOUND'
            });
        }

        return successResponse(reply, {
            message: `Estado de jornada actualizado a ${status}`,
            data: workday,
            statusCode: 200
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
                message: 'Jornada no encontrada',
                error: 'NOT_FOUND'
            });
        }

        return successResponse(reply, {
            message: 'Jornada eliminada exitosamente',
            data: workday,
            statusCode: 200
        });
    } catch (error) {
        return handleServiceError(error, reply);
    }
};
