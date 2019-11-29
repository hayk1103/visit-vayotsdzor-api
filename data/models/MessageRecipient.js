'use strict';

const _ = require('lodash');

const { RecipientStatus } = require('../lcp');

module.exports = (sequelize, DataTypes) => {
    const MessageRecipient = sequelize.define(
        'MessageRecipient',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            status: {
                type: DataTypes.ENUM,
                values: _.values(RecipientStatus),
                defaultValue: RecipientStatus.PUBLISHED
            },
            isSeen: {
                defaultValue: false,
                type: DataTypes.BOOLEAN
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            tableName: 'messageRecipient',
            timestamps: true
        }
    );

    MessageRecipient.associate = models => {
        MessageRecipient.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId'
        });

        MessageRecipient.belongsTo(models.Thread, {
            as: 'thread',
            foreignKey: 'threadId'
        });

        MessageRecipient.belongsTo(models.Message, {
            as: 'message',
            foreignKey: 'messageId'
        });
    };

    MessageRecipient.addScopes = models => {
        MessageRecipient.addScope('recipients', messageId => {
            return { where: { messageId } };
        });
    };

    MessageRecipient.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = ['threadId', 'updatedAt', 'messageId', 'createdAt'];

        return _.omit(model, hiddenFields);
    };

    return MessageRecipient;
};
