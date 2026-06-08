/**
 * Respuesta estándar de éxito.
 *
 * @param {import('fastify').FastifyReply} reply
 * @param {{ message: string, data?: unknown, statusCode?: number, meta?: object }} options
 */
export const successResponse = (reply, { message, data = null, statusCode = 200, meta = null }) => {
    const body = {
        success: true,
        message,
        ...(data !== null && { data }),
        ...(meta !== null && { meta }),
    };
    return reply.status(statusCode).send(body);
};