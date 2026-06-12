import { SERVICES } from '../config/services.js';

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
            throw new Error('La jornada no existe');
        }

        if (!response.ok) {
            throw new Error('Error al consultar el servicio de jornadas');
        }

        const data = await response.json();

        if (!data.success || !data.data) {
            throw new Error('La jornada no existe');
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
