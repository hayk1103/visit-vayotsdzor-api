'use strict';

const _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
    const ThreadUser = sequelize.define(
        'ThreadUser',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            seeFrom: {
                allowNull: false,
                type: DataTypes.DATE
            }
        },
        {
            tableName: 'threadUser',
            timestamps: true
        }
    );

    ThreadUser.associate = models => {
        ThreadUser.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId'
        });

        ThreadUser.belongsTo(models.Thread, {
            as: 'thread',
            foreignKey: 'threadId'
        });
    };

    ThreadUser.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = ['userId', 'threadId'];

        return _.omit(model, hiddenFields);
    };

    return ThreadUser;
};
