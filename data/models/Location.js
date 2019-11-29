'use strict';

const _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
    const Location = sequelize.define(
        'Location',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            country: {
                type: DataTypes.STRING
            },
            city: {
                type: DataTypes.STRING
            },
            state: {
                type: DataTypes.STRING
            },
            zipCode: {
                type: DataTypes.STRING
            }
        },
        {
            tableName: 'location',
            timestamps: true,
            setterMethods: {
                country(value) {
                    this.setDataValue('country', value ? _.trim(value) : null);
                },
                city(value) {
                    this.setDataValue('city', value ? _.trim(value) : null);
                },
                state(value) {
                    this.setDataValue('state', value ? _.trim(value) : null);
                },
                zipCode(value) {
                    this.setDataValue('zipCode', value ? _.trim(value) : null);
                }
            }
        },
        {
            validate: {}
        }
    );

    Location.associate = models => {
        Location.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId'
        });
    };

    Location.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = ['id', 'userId', 'jobId', 'createdAt', 'updatedAt'];

        return _.omit(model, hiddenFields);
    };

    return Location;
};
