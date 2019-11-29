'use strict';

const _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
    const Education = sequelize.define(
        'Education',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING
            },
            degree: {
                type: DataTypes.STRING
            },
            date: {
                type: DataTypes.STRING
            }
        },
        {
            timestamps: false,
            tableName: 'education'
        }
    );

    Education.associate = models => {
        Education.belongsTo(models.UserInfo, {
            as: 'userInfo',
            foreignKey: 'userInfoId'
        });
    };

    Education.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = ['id', 'userInfoId'];

        return _.omit(model, hiddenFields);
    };

    return Education;
};
