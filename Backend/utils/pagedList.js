const { pagination } = require('./pagination');
module.exports = async function pagedList(model, filter, query, key) {
  const { page, limit, skip } = pagination(query, 20);
  const [items, total] = await Promise.all([
    model.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean().maxTimeMS(5000),
    model.countDocuments(filter).maxTimeMS(5000),
  ]);
  return { [key]: items, pagination: { page, limit, total, hasMore: skip + items.length < total } };
};
