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
