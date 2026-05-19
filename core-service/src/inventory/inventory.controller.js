import centralInventory from "./centralInventory.model.js";
import WorkdayInventory from './workdayInventory.model.js'; 

export const getInventarioCentral = async (request, reply) => {
    try {
        const inventarios = await centralInventory.find().populate("medicineId");
        return reply.status(200).send({
            success: true,
            message: "Inventario central",
            data: inventarios
        });
    } catch (error) {
        return reply.status(400).send({
            success: false,
            message: "Error al consultar inventario central",
            error: error.message
        });
    }
};

export const getInventarioJornada = async (request, reply) => {
    try {
        const { jornadaId } = request.params;
        const inventario = await WorkdayInventory.find({ workdayId: jornadaId }).populate('medicineId');

        return reply.status(200).send({
        success: true,
        message: 'Inventario de jornada',
        data: inventario
        });
    } catch (error) {
        return reply.status(400).send({
        success: false,
        message: 'Error al consultar inventario de jornada',
        error: error.message
        });
    }
};