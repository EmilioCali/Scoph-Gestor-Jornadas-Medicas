export function getPaginationParams(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

export function paginatedResponse(data, total, page, limit) {
    return {
        data,
        pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
        }
    };
}