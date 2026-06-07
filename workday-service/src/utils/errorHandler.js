import fp from 'fastify-plugin';

export const ERROR_CODES = {
    VALIDATION_ERROR:    'VALIDATION_ERROR',
    NOT_FOUND:           'NOT_FOUND',
    DUPLICATE_KEY:       'DUPLICATE_KEY',
    UNAUTHORIZED:        'UNAUTHORIZED',
    FORBIDDEN:           'FORBIDDEN',
    CAST_ERROR:          'INVALID_ID',
    INTERNAL_ERROR:      'INTERNAL_ERROR',
};

export class AppError extends Error {
    constructor(message, statusCode = 500, errorCode = ERROR_CODES.INTERNAL_ERROR, details = null) {
        super(message);
        this.name       = 'AppError';
        this.statusCode = statusCode;
        this.errorCode  = errorCode;
        this.details    = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const notFound     = (msg = 'Recurso no encontrado') => new AppError(msg, 404, ERROR_CODES.NOT_FOUND);
export const unauthorized = (msg = 'No autorizado')         => new AppError(msg, 401, ERROR_CODES.UNAUTHORIZED);
export const forbidden    = (msg = 'Acceso denegado')       => new AppError(msg, 403, ERROR_CODES.FORBIDDEN);
export const badRequest   = (msg, details = null)           => new AppError(msg, 400, ERROR_CODES.VALIDATION_ERROR, details);

const normalizeMongo = (error) => {
    if (error.name === 'CastError')
        return new AppError(`ID inválido: ${error.value}`, 400, ERROR_CODES.CAST_ERROR);

    if (error.code === 11000) {
        const field = Object.keys(error.keyValue ?? {})[0] ?? 'campo';
        return new AppError(`El valor de "${field}" ya existe`, 409, ERROR_CODES.DUPLICATE_KEY, error.keyValue);
    }

    if (error.name === 'ValidationError') {
        const details = Object.values(error.errors).map((e) => ({ field: e.path, message: e.message }));
        return new AppError('Error de validación', 422, ERROR_CODES.VALIDATION_ERROR, details);
    }

    return null;
};

export const handleServiceError = (error, reply) => {
    const isDev = process.env.NODE_ENV !== 'production';

    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            success: false,
            message: error.message,
            error:   error.errorCode,
            ...(error.details !== null && { details: error.details }),
            ...(isDev && { stack: error.stack }),
        });
    }

    const mongoError = normalizeMongo(error);
    if (mongoError) return handleServiceError(mongoError, reply);

    if (error.validation) {
        return reply.status(400).send({
            success: false,
            message: 'Error de validación en la solicitud',
            error:   ERROR_CODES.VALIDATION_ERROR,
            details: error.validation,
        });
    }

    reply.log.error(error);
    return reply.status(500).send({
        success: false,
        message: 'Error interno del servidor',
        error:   ERROR_CODES.INTERNAL_ERROR,
        ...(isDev && { stack: error?.stack }),
    });
};

export const globalErrorHandler = fp(async (fastify) => {
    fastify.setErrorHandler((error, request, reply) => {
        handleServiceError(error, reply);
    });
});