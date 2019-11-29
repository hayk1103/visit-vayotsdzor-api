'use strict';

const _ = require('lodash');

const { User, ThreadUser, MessageRecipient } = require('../data/models');
const { Mailer } = require('../components');
const config = require('../config');

class Notification {
    static async sendMail(id, templateName) {
        const template = config.get(`params:mailer:templates:${templateName}`);
        const user = await User.findByPk(id);

        Mailer.send(
            _.extend(
                {
                    data: { firstName: _.get(user, 'firstName') },
                    to: [user.email]
                },
                template
            )
        );
    }

    static async activation(user, activationCode) {
        Mailer.send(
            _.extend(
                {
                    data: { firstName: user.firstName, activationCode },
                    to: [user.email]
                },
                config.get('params:mailer:templates:activation')
            )
        );
    }

    static async forgotPassword(user, activationCode) {
        Mailer.send(
            _.extend(
                {
                    data: { firstName: user.firstName, activationCode },
                    to: [user.email]
                },
                config.get('params:mailer:templates:forgotPassword')
            )
        );
    }

    static async messageNew(message, thread) {
        const messageValues = message.get({ plain: true });
        const { id: threadId } = thread;

        const receivers = await MessageRecipient.scope({ method: ['recipients', message.id, threadId] }).findAll();

        for (const receiver of receivers) {
            const receiverId = receiver.userId;

            global.io.to(receiverId).emit('message:new', {
                data: {
                    message: messageValues,
                    thread: {
                        id: threadId,
                        isRead: receiver.isRead,
                        isSeen: receiver.isSeen,
                        isMuted: receiver.isMuted
                    }
                }
            });
        }
    }

    static async messageRead(sender, messageIds, threadId) {
        const { id: senderId } = sender;

        const userIds = _.map(
            await ThreadUser.findAll({
                where: { threadId, userId: { $ne: senderId } },
                attributes: ['userId'],
                raw: true
            }),
            'userId'
        );

        const data = { messageIds, threadId, senderId };

        _.forEach(userIds, userId => {
            global.io.to(userId).emit('message:read', data);
        });
    }

    static async messageTyping(sender, isTyping, threadId) {
        const { id: senderId } = sender;

        const userIds = _.map(
            await ThreadUser.findAll({
                where: { threadId, userId: { $ne: senderId } },
                attributes: ['userId'],
                raw: true
            }),
            'userId'
        );

        const data = { isTyping, threadId, senderId };

        _.forEach(userIds, userId => {
            global.io.to(userId).emit('message:typing', data);
        });
    }

    static async messageDelete(sender, messageId, threadId) {
        const { id: senderId } = sender;

        const userIds = _.map(
            await ThreadUser.findAll({
                where: { threadId, userId: { $ne: senderId } },
                attributes: ['userId'],
                raw: true
            }),
            'userId'
        );

        const data = { messageId, threadId, senderId };

        _.forEach(userIds, userId => {
            global.io.to(userId).emit('message:delete', data);
        });
    }
}

module.exports = Notification;
