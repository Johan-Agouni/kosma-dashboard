const buildPagination = (query, defaults = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaults.limit || 20));
    const skip = (page - 1) * limit;

    const sortField = query.sort || defaults.sort || 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    return { page, limit, skip, sort };
};

const paginatedResponse = (data, total, { page, limit }) => ({
    data,
    pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
    },
});

module.exports = { buildPagination, paginatedResponse };
