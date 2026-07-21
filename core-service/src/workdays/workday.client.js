import { SERVICES } from '../config/services.js';
import { ServiceError, NotFoundError } from '../utils/errorHandler.js';

export async function getWorkdayById(workdayId, authHeader) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(
            `${SERVICES.workday.baseUrl}/api/v1/workdays/${workdayId}`,
            {
                signal: controller.signal,
                headers: authHeader ? { Authorization: authHeader } : {}
            }
        );

        if (response.status === 404) {
            throw new NotFoundError('La jornada no existe');
        }

        if (response.status === 403) {
            throw new ServiceError('No tienes permiso para acceder a esta jornada', 403);
        }

        if (!response.ok) {
            throw new Error('Error al consultar el servicio de jornadas');
        }

        const data = await response.json();

        if (!data.success || !data.data) {
            throw new NotFoundError('La jornada no existe');
        }

        return data.data;

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('El servicio de jornadas no responde (timeout)');
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}
