'use strict';

const { Category, generateSearchQuery } = require('../data/models');

class CategoryHandler {
    static async actionIndex(ctx) {
        const { limit, offset } = ctx.paginate;
        const { q = '' } = ctx.query;

        const searchCondition = generateSearchQuery(q, ['title']);

        const { rows: categories, count: total } = await Category.findAndCountAll({
            where: searchCondition,
            offset,
            limit
        });

        return ctx.ok({
            categories,
            _meta: {
                total,
                pageCount: Math.ceil(total / limit)
            }
        });
    }
}

module.exports = CategoryHandler;
