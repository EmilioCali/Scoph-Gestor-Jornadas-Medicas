const resolveServiceUrl = (internalHostPort, publicUrl, localUrl) => {
    if (internalHostPort) return `http://${internalHostPort}`;
    return publicUrl || localUrl;
};

export const SERVICES = {
    workday: {
        baseUrl: resolveServiceUrl(
            process.env.WORKDAY_SERVICE_HOSTPORT,
            process.env.WORKDAY_SERVICE_URL,
            'http://localhost:3021'
        ),
    }
};
