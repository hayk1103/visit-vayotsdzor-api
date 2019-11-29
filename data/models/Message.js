'use strict';

const _ = require('lodash');

const { RecipientStatus } = require('../lcp');

module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define(
        'Message',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            text: {
                allowNull: false,
                type: DataTypes.TEXT,
                validate: {
                    len: [0, 20000]
                }
            }
        },
        {
            tableName: 'message',
            timestamps: true,
            setterMethods: {
                text(value) {
                    this.setDataValue('text', value ? _.trim(value) : null);
                }
            }
        }
    );

    Message.associate = models => {
        Message.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId'
        });

        Message.belongsTo(models.Thread, {
            as: 'thread',
            foreignKey: 'threadId'
        });

        Message.hasMany(models.MessageRecipient, {
            as: 'recipients',
            foreignKey: 'messageId'
        });
    };

    Message.addScopes = models => {
        Message.addScope('expand', userId => {
            return {
                where: {
                    id: {
                        $notIn: models.MessageRecipient.generateNestedQuery({
                            attributes: ['messageId'],
                            where: { userId, status: RecipientStatus.DELETED }
                        })
                    }
                },
                include: [
                    {
                        model: models.User,
                        as: 'user'
                    }
                ]
            };
        });
    };

    Message.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = ['userId', 'recipients'];

        return _.omit(model, hiddenFields);
    };

    return Message;
};
