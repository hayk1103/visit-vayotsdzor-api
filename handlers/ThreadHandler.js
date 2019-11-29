'use strict';

const _ = require('lodash');

const { MessageRecipient, ThreadUser, Thread, User, sequelize, generateSearchQuery } = require('../data/models');
const { ErrorMessages } = require('../constants');
const { Notification } = require('../services');
const { ThreadType } = require('../data/lcp');

class ThreadHandler {
    static async actionIndex(ctx) {
        const userId = _.get(ctx.state, 'user.id', null);
        const { limit, offset } = ctx.paginate;
        const { q = '' } = ctx.query;
        const unSeen = false;

        const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q) : {};

        const { rows: threads, count: total } = await Thread.scope({
            method: ['main', userId, unSeen, searchCondition]
        }).findAndCountAll({
            offset,
            limit
        });

        await MessageRecipient.update({ isSeen: true }, { where: { userId, isSeen: false } });

        return ctx.ok({
            threads,
            _meta: {
                total,
                pageCount: Math.ceil(total / limit)
            }
        });
    }

    static async actionView(ctx) {
        const userId = _.get(ctx.state, 'user.id', null);
        const { threadId } = ctx.params;

        const thread = await Thread.scope({ method: ['available', userId] }).findByPk(threadId);

        return !_.isEmpty(thread) ? ctx.ok({ thread }) : ctx.notFound(ErrorMessages.THREAD_NOT_FOUND);
    }

    static async actionCreate(ctx) {
        const { id: senderId } = ctx.state.user;
        let { userIds } = ctx.request.body;

        userIds = _.filter(userIds, userId => userId !== senderId);

        if (_.isEmpty(userIds)) {
            return ctx.badRequest(ErrorMessages.IDS_REQUIRED);
        }

        let id = {};
        const type = userIds.length === 1 ? ThreadType.DIRECT : ThreadType.GROUP;

        if (type === ThreadType.DIRECT) {
            const receiverId = userIds[0];

            const receiver = await User.findOne({
                where: { id: receiverId },
                raw: true
            });

            if (_.isEmpty(receiver)) {
                return ctx.notFound(ErrorMessages.USER_NOT_FOUND);
            }

            id = await sequelize.transaction(async transaction => {
                const { id: threadId } = await Thread.create({ type }, { transaction });

                await ThreadUser.bulkCreate(
                    [
                        { userId: senderId, threadId, seeFrom: new Date() },
                        { userId: receiverId, threadId, seeFrom: new Date() }
                    ],
                    { validate: true, transaction }
                );

                return threadId;
            });
        } else if (type === ThreadType.GROUP) {
            id = await sequelize.transaction(async transaction => {
                const { id: threadId } = await Thread.create({ type }, { transaction });

                await ThreadUser.bulkCreate(
                    _.concat(
                        _.map(userIds, userId => ({ userId, threadId, seeFrom: new Date() })),
                        [{ userId: senderId, threadId, seeFrom: new Date() }]
                    ),
                    { validate: true, transaction }
                );

                return threadId;
            });
        }

        return ctx.created({ thread: await Thread.scope({ method: ['available', senderId] }).findByPk(id) });
    }

    static async actionTyping(ctx) {
        const { isTyping } = ctx.request.body;
        const { threadId } = ctx.params;
        const { user } = ctx.state;
        const userId = user.id;

        const thread = await Thread.scope({ method: ['available', userId] }).findByPk(threadId);

        if (_.isEmpty(thread)) {
            return ctx.notFound(ErrorMessages.THREAD_NOT_FOUND);
        } else if (!_.isBoolean(isTyping)) {
            return ctx.badRequest(ErrorMessages.FILED_TYPE_MUST_BE_BOOLEAN);
        }

        Notification.messageTyping(user, isTyping, threadId).catch(console.trace);

        return ctx.accepted();
    }

    static async actionDelete(ctx) {
        const { id: userId } = ctx.state.user;
        const { threadId } = ctx.params;

        const thread = await Thread.scope({ method: ['available', userId] }).findByPk(threadId);

        if (_.isEmpty(thread)) {
            return ctx.notFound(ErrorMessages.THREAD_NOT_FOUND);
        }

        await ThreadUser.update({ seeFrom: new Date() }, { where: { threadId, userId } });

        ctx.accepted();
    }
}

module.exports = ThreadHandler;
