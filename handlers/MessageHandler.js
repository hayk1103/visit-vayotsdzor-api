'use strict';

const _ = require('lodash');

const { MessageRecipient, ThreadUser, Message, Thread, sequelize } = require('../data/models');
const { RecipientStatus } = require('../data/lcp');
const { ErrorMessages } = require('../constants');
const { Notification } = require('../services');

class MessageHandler {
    static async actionIndex(ctx) {
        const { limit, offset, page: currentPage } = ctx.state.paginate;
        const userId = _.get(ctx.state, 'user.id', null);
        const { threadId } = ctx.params;

        const thread = await Thread.scope({ method: ['available', userId] }).findByPk(threadId);

        if (_.isEmpty(thread)) {
            return ctx.notFound(ErrorMessages.THREAD_NOT_FOUND);
        }

        const threadUser = await ThreadUser.findOne({ where: { threadId, userId } });

        const { rows: messages, count: total } = await Message.scope({
            method: ['expand', userId]
        }).findAndCountAll({
            where: {
                createdAt: !_.isEmpty(threadUser) ? { $gte: threadUser.seeFrom } : { $ne: null },
                threadId
            },
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });

        return ctx.ok({
            messages,
            _meta: {
                total,
                currentPage,
                pageCount: Math.ceil(total / limit)
            }
        });
    }

    static async actionCreate(ctx) {
        const { text } = ctx.request.body;
        const { threadId } = ctx.params;
        const { user } = ctx.state;
        const userId = user.id;

        const thread = await Thread.scope({ method: ['available', userId] }).findByPk(threadId);

        if (_.isEmpty(thread)) {
            return ctx.notFound(ErrorMessages.THREAD_NOT_FOUND);
        }

        const threadUsers = await ThreadUser.findAll({ where: { threadId: thread.id } });

        const id = await sequelize.transaction(async transaction => {
            const index = (await Message.count({ where: { threadId } })) + 1;

            const model = await Message.create({ text, threadId, userId, index }, { transaction });
            await MessageRecipient.bulkCreate(
                _.map(threadUsers, user => ({
                    threadId,
                    messageId: model.id,
                    userId: user.userId
                })),
                { validate: true, transaction }
            );

            return model.id;
        });

        const message = await Message.scope({ method: ['expand', userId] }).findByPk(id);

        Notification.messageNew(message, thread).catch(console.trace);

        return ctx.created({ message });
    }

    static async actionRead(ctx) {
        let { messageIds } = ctx.request.body;
        const { threadId } = ctx.params;
        const { user } = ctx.state;
        const userId = user.id;

        const thread = await Thread.scope({ method: ['available', userId] }).findByPk(threadId);

        if (_.isEmpty(thread)) {
            return ctx.notFound(ErrorMessages.THREAD_NOT_FOUND);
        } else if (_.isEmpty(messageIds)) {
            return ctx.badRequest(ErrorMessages.IDS_REQUIRED);
        }

        await MessageRecipient.update(
            { isRead: true },
            { where: { messageId: messageIds, userId, threadId, isRead: false } }
        );

        Notification.messageRead(user, messageIds, threadId).catch(console.trace);

        return ctx.accepted();
    }

    static async actionDelete(ctx) {
        const { threadId, messageId } = ctx.params;
        const { user } = ctx.state;
        const userId = user.id;

        const [thread, message] = await Promise.all([
            Thread.scope({ method: ['available', userId] }).findByPk(threadId),
            Message.findOne({ where: { id: messageId, threadId } })
        ]);

        if (_.isEmpty(thread)) {
            return ctx.notFound(ErrorMessages.THREAD_NOT_FOUND);
        } else if (_.isEmpty(message)) {
            return ctx.notFound(ErrorMessages.THREAD_NOT_FOUND);
        }

        if (message.userId === userId) {
            await message.destroy();

            Notification.messageDelete(user, messageId, threadId).catch(console.trace);
        } else {
            await MessageRecipient.update({ status: RecipientStatus.DELETED }, { where: { userId, messageId } });
        }

        return ctx.accepted();
    }
}

module.exports = MessageHandler;
