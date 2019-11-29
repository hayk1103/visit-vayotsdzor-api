'use strict';

const _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
    const Skill = sequelize.define(
        'Skill',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING
            }
        },
        {
            timestamps: false,
            tableName: 'skill'
        }
    );

    Skill.associate = models => {
        Skill.belongsTo(models.UserInfo, {
            as: 'userInfo',
            foreignKey: 'userInfoId'
        });
    };

    Skill.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = ['id', 'userInfoId'];

        return _.omit(model, hiddenFields);
    };

    return Skill;
};
