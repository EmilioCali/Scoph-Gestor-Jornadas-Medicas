export class ServiceError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'ServiceError';
        this.statusCode = statusCode;
    }
}

export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

export function handleServiceError(error, reply) {
    if (error.name === 'ServiceError' ||
        error.name === 'NotFoundError' ||
        error.name === 'ValidationError') {
        return reply.status(error.statusCode).send({
            success: false,
            message: error.message,
            error: error.name
        });
    }

    if (error.name === 'AbortError') {
        return reply.status(504).send({
            success: false,
            message: 'El servicio externo no responde',
            error: 'TIMEOUT'
        });
    }

    if (error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED') {
        return reply.status(503).send({
            success: false,
            message: 'El servicio externo no está disponible',
            error: 'SERVICE_UNAVAILABLE'
        });
    }

    if (error.name === 'CastError') {
        return reply.status(400).send({
            success: false,
            message: `Identificador inválido: ${error.value}`,
            error: 'INVALID_ID'
        });
    }

    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message).join(', ');
        return reply.status(400).send({
            success: false,
            message: messages,
            error: 'VALIDATION_ERROR'
        });
    }

    return reply.status(400).send({
        success: false,
        message: error.message,
        error: 'BAD_REQUEST'
    });
}