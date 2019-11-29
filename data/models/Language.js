'use strict';

const _ = require('lodash');

const { LanguagesType } = require('../lcp');

module.exports = (sequelize, DataTypes) => {
    const Language = sequelize.define(
        'Language',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            level: {
                allowNull: false,
                type: DataTypes.ENUM,
                values: _.values(LanguagesType)
            },
            value: {
                allowNull: false,
                type: DataTypes.ENUM,
                values: _.keys(LanguagesType)
            }
        },
        {
            timestamps: false,
            tableName: 'language'
        }
    );

    Language.associate = models => {
        Language.belongsTo(models.UserInfo, {
            as: 'userInfo',
            foreignKey: 'userInfoId'
        });
    };

    Language.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = ['id', 'userInfoId'];

        return _.omit(model, hiddenFields);
    };

    return Language;
};
