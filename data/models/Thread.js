'use strict';

const _ = require('lodash');

const { RecipientStatus, ThreadType } = require('../../data/lcp');

module.exports = (sequelize, DataTypes) => {
    const Thread = sequelize.define(
        'Thread',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            type: {
                allowNull: false,
                type: DataTypes.ENUM,
                values: _.values(ThreadType)
            }
        },
        {
            tableName: 'thread',
            timestamps: true
        }
    );

    Thread.associate = models => {
        Thread.hasMany(models.Message, {
            as: 'messages',
            foreignKey: 'threadId'
        });

        Thread.hasMany(models.ThreadUser, {
            as: 'interlocutor',
            foreignKey: 'threadId'
        });

        Thread.hasMany(models.MessageRecipient, {
            as: 'recipient',
            foreignKey: 'threadId'
        });
    };

    Thread.addScopes = models => {
        const include = [
            {
                where: sequelize.literal('`userId` != :userId'),
                model: models.ThreadUser,
                as: 'interlocutor',
                limit: 3,
                include: [
                    {
                        attributes: ['id', 'firstName', 'lastName', 'email'],
                        model: models.User,
                        as: 'user'
                    }
                ]
            }
        ];

        Thread.addScope('available', userId => {
            const requiredCondition = {
                id: {
                    $in: models.ThreadUser.generateNestedQuery({
                        attributes: ['threadId'],
                        where: { userId }
                    })
                }
            };

            return {
                where: { $and: [requiredCondition] },
                include: [
                    {
                        where: { userId: { $ne: userId } },
                        model: models.ThreadUser,
                        as: 'interlocutor',
                        limit: 3,
                        include: [
                            {
                                attributes: ['id', 'firstName', 'lastName', 'email'],
                                model: models.User,
                                as: 'user'
                            }
                        ]
                    }
                ]
            };
        });

        Thread.addScope('main', (userId, unSeen = false, searchQuery = {}) => {
            const requiredCondition = {
                $and: [
                    {
                        id: {
                            $in: models.ThreadUser.generateNestedQuery({
                                attributes: ['threadId'],
                                where: { userId }
                            })
                        }
                    },
                    {
                        id: {
                            $in: models.MessageRecipient.generateNestedQuery({
                                attributes: ['threadId'],
                                where: { userId, status: RecipientStatus.PUBLISHED }
                            })
                        }
                    }
                ]
            };

            let unSeenCondition = {};
            let searchCondition = {};
            if (!_.isEmpty(searchQuery)) {
                searchCondition = {
                    id: {
                        $in: models.ThreadUser.generateNestedQuery({
                            attributes: ['threadId'],
                            where: {
                                userId: {
                                    $in: models.User.generateNestedQuery({
                                        attributes: ['id'],
                                        where: { $and: [{ id: { $ne: userId } }, searchQuery] }
                                    })
                                }
                            }
                        })
                    }
                };
            }

            return {
                where: { $and: [requiredCondition, searchCondition, unSeenCondition] },
                replacements: { userId },
                include
            };
        });
    };

    Thread.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = [];

        return _.omit(model, hiddenFields);
    };

    return Thread;
};
