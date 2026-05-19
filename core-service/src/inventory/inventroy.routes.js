import { getInventarioCentral, getInventarioJornada } from './inventory.controller.js';

const inventoryRoutes = async (fastify) =>{
    fastify.get('/inventario-central', getInventarioCentral);
    fastify.get('/inventario-jornada/:jornadaId', getInventarioJornada);
}

export default inventoryRoutes;