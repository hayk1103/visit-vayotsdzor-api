'use strict';

const _ = require('lodash');

const { UserTokenType } = require('../lcp');

module.exports = (sequelize, DataTypes) => {
    const UserToken = sequelize.define(
        'UserToken',
        {
            token: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            type: {
                allowNull: false,
                type: DataTypes.ENUM,
                values: _.values(UserTokenType)
            }
        },
        {
            tableName: 'userToken',
            timestamps: true
        }
    );

    UserToken.associate = function(models) {
        UserToken.belongsTo(models.User, {
            as: 'user'
        });
    };

    return UserToken;
};
