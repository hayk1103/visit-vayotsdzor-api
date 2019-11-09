'use strict';

const _ = require('lodash');
const validator = require('validator');

const { UserToken, User, sequelize } = require('../data/models');
const { Security, Sanitize, Mailer } = require('../components');
const { ErrorMessages } = require('../constants');
const { UserTokenType } = require('../data/lcp');
const { Notification } = require('../services');

class UserPasswordHandler {
    static async actionCheckPasswordCode(ctx) {
        const { code: forgotPasswordCode, email } = ctx.request.body;

        if (_.isEmpty(email) || _.isEmpty(forgotPasswordCode)) {
            return ctx.badRequest(ErrorMessages.INVALID_ARGUMENTS);
        }

        const user = await User.findOne({ where: { email: validator.normalizeEmail(email) } });

        if (_.isEmpty(user)) {
            return ctx.notFound(ErrorMessages.USER_NOT_FOUND);
        } else if (_.toNumber(forgotPasswordCode) !== user.forgotPasswordCode) {
            return ctx.badRequest(ErrorMessages.INVALID_CODE);
        }

        let forgotPassword = await user.getForgotPasswordToken();

        if (_.isEmpty(forgotPassword)) {
            forgotPassword = await user.createForgotPasswordToken();
        }

        return ctx.ok({ token: forgotPassword.token });
    }

    static async actionResetPassword(ctx) {
        const password = ctx.request.headers.password || ctx.request.body.password;
        const token = ctx.request.headers['x-token'];
        console.log(token, password)

        if (_.isEmpty(token) || _.isEmpty(password)) {
            return ctx.badRequest(ErrorMessages.INVALID_ARGUMENTS);
        }

        const userToken = await UserToken.findOne({
            where: { token, type: UserTokenType.FORGOT_PASSWORD_TOKEN }
        });

        if (_.isEmpty(userToken)) {
            return ctx.notFound(ErrorMessages.INVALID_TOKEN);
        }

        const user = await User.findOne({ where: { id: userToken.userId } });

        user.password = Sanitize.cleanPassword(password);

        await sequelize.transaction(async transaction => {
            await user.save({ transaction });
            await userToken.destroy({ transaction });
        });

        return ctx.ok();
    }

    static async actionChangePassword(ctx) {
        let { password, newPassword } = ctx.request.body;
        const { user } = ctx.state;

        newPassword = Sanitize.cleanPassword(newPassword);
        password = Sanitize.cleanPassword(password);

        if (!(await user.comparePassword(password))) {
            return ctx.badRequest(ErrorMessages.INVALID_OLD_PASSWORD);
        } else if (password === newPassword) {
            return ctx.badRequest(ErrorMessages.PASSWORDS_DO_NOT_MATCH);
        }

        await user.update({ password: newPassword });

        return ctx.ok({ token: user.generateToken() });
    }

    static async actionForgotPassword(ctx) {
        const { email } = ctx.request.body;

        if (_.isEmpty(email)) {
            return ctx.badRequest(ErrorMessages.EMAIL_REQUIRED);
        }

        const user = await User.findOne({ where: { email: validator.normalizeEmail(email) } });

        if (_.isEmpty(user)) {
            return ctx.notFound(ErrorMessages.USER_NOT_FOUND);
        }

        const forgotPasswordCode = Security.generateRandomNumber();

        await user.update({ forgotPasswordCode });

        Notification.activation(user, forgotPasswordCode).catch(console.trace);

        return ctx.accepted();
    }
}

module.exports = UserPasswordHandler;
