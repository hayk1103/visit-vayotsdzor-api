'use strict';

const _ = require('lodash');
const validator = require('validator');

const {
    User,
    Skill,
    UserInfo,
    Location,
    sequelize,
    Education,
    Language,
    generateSearchQuery
} = require('../data/models');
const { Security, File } = require('../components');
const { ErrorMessages } = require('../constants');
const { AccountType } = require('../data/lcp');
const { Notification } = require('../services');
const config = require('../config');

class UserHandler {
    static async actionView(ctx) {
        const currentUserId = _.get(ctx.state, 'user.id', null);

        const userId = ctx.params.id === 'me' ? currentUserId : ctx.params.id;

        const user = await User.scope({ method: ['full'] }).findByPk(userId);

        if (_.isEmpty(user)) {
            return ctx.notFound(ErrorMessages.USER_NOT_FOUND);
        }

        return ctx.ok({ user });
    }

    static async actionIndex(ctx) {
        const { limit, offset } = ctx.paginate;
        const userId = _.get(ctx.state, 'user.id', null);
        const { q = '', sort = 'asc', accountType = AccountType.EMPLOYEE } = ctx.query;

        if (!_.includes(_.values(AccountType), accountType)) {
            return ctx.badRequest(ErrorMessages.INVALID_ACCOUNT_TYPE);
        }

        const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, ['firstName', 'lastName', 'email']) : {};

        const { rows: users, count: total } = await User.findAndCountAll({
            where: { id: { $ne: userId }, accountType, ...searchCondition },
            order: [
                ['firstName', sort],
                ['lastName', sort]
            ],
            offset,
            limit
        });

        // const userInfo = await UserInfo.findOne({ where: { userId } });

        return ctx.ok({
            users,
            // userInfo,
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

        const activationCode = Security.generateRandomNumeric(5);

        const user = await sequelize.transaction(async transaction => {
            const user = await User.create(_.extend(userData, { activationCode }), { transaction });

            if (!_.isEmpty(avatar)) {
                user.avatar = avatar.key;

                await File.upload(avatar.key, avatar.path).catch(console.trace);
                await user.save({ transaction });
            }

            return user;
        });

        Notification.activation(user, activationCode).catch(console.trace);

        return ctx.created({ user });
    }

    static async actionLogin(ctx) {
        const { email, password } = ctx.request.body;
        const user = await User.scope({ method: ['full'] }).findOne({
            where: { email: validator.normalizeEmail(email) }
        });

        if (_.isEmpty(user) || !(await user.comparePassword(password))) {
            return ctx.notFound(ErrorMessages.INVALID_CREDENTIALS);
        }

        return ctx.ok({ user, token: user.generateToken() });
    }

    static async actionUpdate(ctx) {
        const body = ctx.request.body;
        const { id: userId } = ctx.state.user;
        const { firstName, lastName, dob, gender, info = {} } = body;
        let { location = {}, skills = [], educations = [], bio, languages = [] } = info;

        skills = _.uniq(skills);

        const userLocation = await Location.findOne({ where: { userId } });
        const userInfo = await UserInfo.findOne({ where: { userId } });

        await sequelize.transaction(async transaction => {
            await User.update({ firstName, lastName, dob, gender }, { where: { id: userId }, transaction });
            _.isEmpty(userLocation)
                ? await Location.create(_.extend(location, { userId }), { transaction })
                : await userLocation.update(location, { transaction });

            console.log('before bio')
            const updatedInfo = _.isEmpty(userInfo)
                ? await UserInfo.create({ bio, userId }, { transaction })
                : await userInfo.update({ bio }, { transaction });
            console.log('after bio')

            await Skill.destroy({ where: { userInfoId: updatedInfo.id }, transaction });
            await Education.destroy({ where: { userInfoId: updatedInfo.id }, transaction });
            await Language.destroy({ where: { userInfoId: updatedInfo.id }, transaction });

            if (!_.isEmpty(skills)) {
                await Skill.bulkCreate(
                    _.map(skills, skill => ({
                        name: skill,
                        userInfoId: updatedInfo.id
                    })),
                    { validate: true, transaction }
                );
            }

            if (!_.isEmpty(educations)) {
                await Education.bulkCreate(
                    _.map(educations, education => ({
                        name: education.name,
                        date: education.date,
                        degree: education.degree,
                        userInfoId: updatedInfo.id
                    })),
                    { validate: true, transaction }
                );
            }

            if (!_.isEmpty(languages)) {
                await Language.bulkCreate(
                    _.map(languages, language => ({
                        level: language.level,
                        value: language.value,
                        userInfoId: updatedInfo.id
                    })),
                    { validate: true, transaction }
                );
            }
        });

        return ctx.ok();
    }

    static async actionUploadAvatar(ctx) {
        const { user } = ctx.state;
        const avatar = _.get(ctx.request, 'files.avatar');
        const { extensions, size } = config.get('params:files:avatars:allowed');

        if (_.isEmpty(avatar)) {
            return ctx.badRequest(ErrorMessages.AVATAR_REQUIRED);
        }

        if (!_.includes(extensions, avatar.ext)) {
            return ctx.badRequest(ErrorMessages.INVALID_FILE_TYPE);
        } else if (avatar.size > size) {
            return ctx.badRequest(ErrorMessages.INVALID_FILE_SIZE);
        }

        await sequelize.transaction(async transaction => {
            user.avatar = avatar.key;

            await File.upload(avatar.key, avatar.path).catch(console.trace);
            await user.save({ transaction });
        });

        return ctx.ok({ avatar: await File.getObjectUrl(user.avatar) });
    }

    static async actionRemoveAvatar(ctx) {
        const { user } = ctx.state;

        const avatar = user.avatar;

        if (!_.isEmpty(avatar)) {
            user.avatar = null;
            await user.save();

            File.remove(avatar).catch(console.trace);
        }

        return ctx.noContent();
    }
}

module.exports = UserHandler;
