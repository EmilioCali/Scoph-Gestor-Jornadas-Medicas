import Audit from './audit.model.js';

export const getAuditorias = async (request, reply) => {
    try {
        const { userId, action, module, fecha } = request.query;

        const filtros = {};
        if (userId) filtros.userId = userId;
        if (action) filtros.action = action;
        if (module) filtros.module = module;
        if (fecha) {
        const inicio = new Date(fecha);
        const fin = new Date(fecha);
        fin.setDate(fin.getDate() + 1);
        filtros.date = { $gte: inicio, $lt: fin };
        }

        const auditorias = await Audit.find(filtros).sort({ date: -1 });

        return reply.status(200).send({
        success: true,
        message: 'Auditorías consultadas correctamente',
        data: auditorias
        });
    } catch (error) {
        return reply.status(400).send({
        success: false,
        message: 'Error al consultar auditorías',
        error: error.message
        });
    }
};