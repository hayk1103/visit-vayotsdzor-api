'use strict';

const _ = require('lodash');
const validator = require('validator');

const { ErrorMessages } = require('../constants');
const { Notification } = require('../services');
const { UserStatus } = require('../data/lcp');
const { Security } = require('../components');
const { User } = require('../data/models');

class UserActivationHandler {
    static async actionSendActivationCode(ctx) {
        const { email } = ctx.request.body;

        const user = await User.findOne({
            where: { email: validator.normalizeEmail(email), status: UserStatus.PENDING }
        });

        if (_.isEmpty(user)) {
            return ctx.notFound(ErrorMessages.USER_NOT_FOUND);
        }

        const activationCode = Security.generateRandomNumber();

        await user.update({ activationCode });

        Notification.activation(user, activationCode).catch(console.trace);

        return ctx.accepted();
    }

    static async actionTakeActivationCode(ctx) {
        const { code, email } = ctx.request.body;

        const user = await User.findOne({
            where: { email: validator.normalizeEmail(email), status: UserStatus.PENDING }
        });

        if (_.isEmpty(user)) {
            return ctx.notFound(ErrorMessages.USER_NOT_FOUND);
        }

        if (_.toNumber(code) !== user.activationCode) {
            return ctx.badRequest(ErrorMessages.INVALID_CODE);
        }

        await user.update({ activationCode: null, status: UserStatus.ACTIVATED });

        return ctx.ok();
    }
}

module.exports = UserActivationHandler;
