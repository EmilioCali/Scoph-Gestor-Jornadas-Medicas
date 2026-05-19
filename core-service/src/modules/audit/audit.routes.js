import { getAuditorias } from './audit.controller.js';

const auditRoutes = async (fastify) => {
    fastify.get('/auditoria', getAuditorias);
};

export default auditRoutes;