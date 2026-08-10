const resolveServiceUrl = (internalHostPort, publicUrl, localUrl) => {
    if (internalHostPort) return `http://${internalHostPort}`;
    return publicUrl || localUrl;
};

export const SERVICES = {
    auth: {
        baseUrl: resolveServiceUrl(
            process.env.AUTH_SERVICE_HOSTPORT,
            process.env.AUTH_SERVICE_URL,
            'http://localhost:3020'
        ),
    },
    workday: {
        baseUrl: resolveServiceUrl(
            process.env.WORKDAY_SERVICE_HOSTPORT,
            process.env.WORKDAY_SERVICE_URL,
            'http://localhost:3021'
        ),
    },
    core: {
        baseUrl: resolveServiceUrl(
            process.env.CORE_SERVICE_HOSTPORT,
            process.env.CORE_SERVICE_URL,
            'http://localhost:3022'
        ),
    }
};
