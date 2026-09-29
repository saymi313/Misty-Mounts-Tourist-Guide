function pagination(query, defaultLimit = 50) {
  for (const value of [query.page, query.limit]) {
    if (value !== undefined && (typeof value !== 'string' && typeof value !== 'number')) {
      throw Object.assign(new Error('Invalid pagination value.'), { status: 400 });
    }
  }
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? defaultLimit : Number(query.limit);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000 || !Number.isSafeInteger(limit) || limit < 1 || limit > 200) {
    throw Object.assign(new Error('page must be 1–10000 and limit must be 1–200.'), { status: 400 });
  }
  return { page, limit, skip: (page - 1) * limit };
}
module.exports = { pagination };
