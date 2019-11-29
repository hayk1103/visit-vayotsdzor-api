'use strict';

const _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
    const UserInfo = sequelize.define(
        'UserInfo',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            bio: {
                type: DataTypes.TEXT
            }
        },
        {
            timestamps: true,
            tableName: 'userInfo',
            setterMethods: {
                bio(value) {
                    this.setDataValue('bio', value ? _.trim(value) : null);
                }
            }
        }
    );

    UserInfo.associate = models => {
        UserInfo.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId'
        });

        UserInfo.hasMany(models.Skill, {
            as: 'skills',
            foreignKey: 'userInfoId'
        });

        UserInfo.hasMany(models.Education, {
            as: 'educations',
            foreignKey: 'userInfoId'
        });

        UserInfo.hasMany(models.Language, {
            as: 'languages',
            foreignKey: 'userInfoId'
        });
    };

    UserInfo.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = ['userId'];

        return _.omit(model, hiddenFields);
    };

    return UserInfo;
};
