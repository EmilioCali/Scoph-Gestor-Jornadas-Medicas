export async function authenticate(request, reply) {
    try {
        await request.jwtVerify();
    } catch (error) {
        const err = new Error('Token invalido o expirado');
        err.statusCode = 401;
        throw err;
    }
}

export function requireRole(...roles) {
    return async function (request, reply) {
        await authenticate(request, reply);

        if (!roles.includes(request.user?.rol)) {
            const err = new Error('Acceso denegado');
            err.statusCode = 403;
            throw err;
        }
    };
}
