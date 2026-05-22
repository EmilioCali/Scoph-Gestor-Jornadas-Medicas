import Workday from './workday.model.js';

export const createWorkday = async (request, reply) => {
    try {
        const workdayData = {
            ...request.body,
            manager: {
                ...request.body.manager,
                userId: request.user.id,
                name: request.body.manager?.name || request.user.username
            }
        };

        const workday = await Workday.create(workdayData);

        return reply.status(201).send({
        success: true,
        message: 'Jornada creada exitosamente',
        data: workday,
        });
    } catch (error) {
        return reply.status(400).send({
        success: false,
        message: 'Error al crear la jornada',
        error: error.message,
        });
    }
};

export const getWorkdays = async (request, reply) => {
    try {
        const workdays = await Workday.find();

        return reply.status(200).send({
        success: true,
        data: workdays,
        });
    } catch (error) {
        return reply.status(500).send({
        success: false,
        message: 'Error al obtener las jornadas',
        error: error.message,
        });
    }
};

export const getWorkdayById = async (request, reply) => {
    try {
        const workday = await Workday.findById(request.params.id);

        if (!workday) {
            return reply.status(404).send({
                success: false,
                message: 'Jornada no encontrada',
            });
        }

        return reply.status(200).send({
            success: true,
            data: workday,
        });
    } catch (error) {
        return reply.status(500).send({
            success: false,
            message: 'Error al obtener la jornada',
            error: error.message,
        });
    }
};
