'use strict';

const _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define(
        'Category',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            title: {
                allowNull: false,
                type: DataTypes.STRING,
                unique: { message: 'title.unique' }
            },
            alias: {
                allowNull: false,
                type: DataTypes.STRING,
                unique: { message: 'alias.unique' }
            }
        },
        {
            tableName: 'category',
            timestamps: false,
            setterMethods: {
                title(value) {
                    this.setDataValue('title', value ? _.trim(value) : null);
                },
                alias(value) {
                    this.setDataValue('alias', value ? _.trim(value) : null);
                }
            }
        }
    );

    Category.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = [];

        return _.omit(model, hiddenFields);
    };

    return Category;
};
