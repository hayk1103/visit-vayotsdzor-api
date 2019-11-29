'use strict';

const { ErrorMessages } = require('../constants');

module.exports = async (ctx, next) => {
    try {
        return ctx.state.user.enabled() ? next() : ctx.forbidden(ErrorMessages.USER_NOT_ACTIVATED);
    } catch (ex) {
        console.error(ex);
    }
};
