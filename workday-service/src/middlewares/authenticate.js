export async function authenticate(request, reply) {
    try {
        await request.jwtVerify();
    } catch (error) {
        return reply.status(401).send({
            success: false,
            message: 'Token invalido o expirado',
            error: 'UNAUTHORIZED'
        });
    }
}

export function requireRole(...roles) {
    return async function (request, reply) {
        await authenticate(request, reply);
        if (reply.sent) return;

        if (!roles.includes(request.user?.rol)) {
            return reply.status(403).send({
                success: false,
                message: 'Acceso denegado',
                error: 'FORBIDDEN'
            });
        }
    };
}
