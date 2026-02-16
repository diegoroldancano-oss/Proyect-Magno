function buildPaginationMeta({ page, pageSize, total }) {
    const safeTotal = Number(total) || 0;
    const totalPages = safeTotal > 0 ? Math.ceil(safeTotal / pageSize) : 1;

    return {
        page,
        pageSize,
        total: safeTotal,
        totalPages
    };
}

module.exports = {
    buildPaginationMeta
};
