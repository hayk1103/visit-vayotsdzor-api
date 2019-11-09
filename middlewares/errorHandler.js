'use strict';

const _ = require('lodash');

const VALIDATION_ERROR_NAMES = [
    'SequelizeUniqueConstraintError',
    'SequelizeValidationError',
    'SequelizeDatabaseError',
    'ValidationError'
];

module.exports = () => async (ctx, next) => {
    try {
        await next();

        if (_.isString(ctx.body)) {
            ctx.body = { message: ctx.body };
        }

        ctx.body = _.extend({}, { statusCode: ctx.status }, ctx.body);
    } catch (ex) {
        let exceptions = [];

        if (VALIDATION_ERROR_NAMES.includes(ex.name)) {
            exceptions = _.isEmpty(ex.errors) ? [ex.original] : ex.errors;
        }

        if (!_.isEmpty(exceptions)) {
            const errors = [];

            for (const err of Object.values(exceptions)) {
                const message = err.kind === 'user defined' ? err.message : err.kind || err.message;

                errors.push({
                    field: err.path || err.constraint,
                    message: _.snakeCase(`err_${message.toLocaleLowerCase()}`)
                });
            }

            return (ctx.body = {
                message: 'ValidationError',
                statusCode: 422,
                errors
            });
        }

        console.error(ex);

        ctx.body = { statusCode: 500 };
    }
};
