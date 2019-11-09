'use strict';

const _ = require('lodash');
const validator = require('validator');

const { Location, User, sequelize, generateSearchQuery } = require('../data/models');
const { Security, File } = require('../components');
const { ErrorMessages } = require('../constants');
const { Notification } = require('../services');
const config = require('../config');

class UserHandler {
    static async actionView(ctx) {
        const currentUserId = _.get(ctx.state, 'user.id', null);

        const userId = ctx.params.id === 'me' ? currentUserId : ctx.params.id;

        const user = await User.findByPk(userId);
        if (_.isEmpty(user)) {
            return ctx.notFound(ErrorMessages.USER_NOT_FOUND);
        }

        return ctx.ok({ user });
    }

    static async actionIndex(ctx) {
        const { limit, offset } = ctx.paginate;
        const userId = _.get(ctx.state, 'user.id', null);
        const { q = '', sort = 'asc' } = ctx.query;

        const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, ['firstName', 'lastName', 'email']) : {};

        const { rows: users, count: total } = await User.findAndCountAll({
            where: { id: { $ne: userId }, ...searchCondition },
            order: [['firstName', sort], ['lastName', sort]],
            offset,
            limit
        });

        return ctx.ok({
            users,
            _meta: {
                total,
                pageCount: Math.ceil(total / limit)
            }
        });
    }

    static async actionCreate(ctx) {
        const userFields = ['firstName', 'lastName', 'phone', 'email', 'password', 'gender', 'dob', 'accountType'];
        const { extensions, size } = config.get('params:files:avatars:allowed');
        const userData = _.pick(ctx.request.body, userFields);
        const avatar = _.get(ctx.request, 'files.avatar');

        if (!_.isEmpty(avatar)) {
            if (!_.includes(extensions, avatar.ext)) {
                return ctx.badRequest(ErrorMessages.INVALID_FILE_TYPE);
            } else if (avatar.size > size) {
                return ctx.badRequest(ErrorMessages.INVALID_FILE_SIZE);
            }
        }

        // const activationCode = Security.generateRandomNumeric(5);

        const user = await sequelize.transaction(async transaction => {
            const user = await User.create(_.extend(userData), { transaction });//, { activationCode }

            if (!_.isEmpty(avatar)) {
                user.avatar = avatar.key;
                await File.upload(avatar.key, avatar.path).catch(console.trace);
                await user.save({ transaction });
            }

            return user;
        });

        // Notification.activation(user, activationCode).catch(console.trace);

        return ctx.created({ user });
    }

    static async actionLogin(ctx) {
        const { email, password } = ctx.request.body;
        const user = await User.findOne({ where: { email: validator.normalizeEmail(email) } });

        if (_.isEmpty(user) || !(await user.comparePassword(password))) {
            return ctx.notFound(ErrorMessages.INVALID_CREDENTIALS);
        }

        return ctx.ok({ user, token: user.generateToken() });
    }

    static async actionUpdate(ctx) {
        const userFields = ['firstName', 'lastName', 'gender', 'dob'];
        const { id: userId } = ctx.state.user;
        const { body } = ctx.request;

        const location = Security.jsonParser(_.get(body, 'location'));

        const locationModel = await Location.findOne({ where: { userId } });

        await sequelize.transaction(async transaction => {
            await User.update(_.pick(body, userFields), { where: { id: userId }, transaction });

            if (!_.isEmpty(location) && _.isObject(location)) {
                locationModel
                    ? await locationModel.update(location, { transaction })
                    : await Location.create(_.extend({ userId }, location), { transaction });
            }
        });

        return ctx.ok({ user: await User.findByPk(userId) });
    }
}
module.exports = UserHandler;
