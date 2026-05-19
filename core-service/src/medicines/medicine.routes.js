import { createMedicine, getMedicines } from './medicine.controller.js';

const medicineRoutes = async (fastify) => {
    fastify.post('/medicines', createMedicine);
    fastify.get('/medicines', getMedicines);
};

export default medicineRoutes;