'use strict';

const _ = require('lodash');

const { UserTokenType } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('userToken', {
            token: {
                primaryKey: true,
                type: Sequelize.UUID
            },
            userId: {
                allowNull: false,
                onDelete: 'CASCADE',
                type: Sequelize.UUID,
                references: {
                    model: 'user',
                    key: 'id'
                }
            },
            type: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: _.values(UserTokenType)
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('userToken', { unique: true, fields: ['userId', 'type'] });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('userToken', {});
    }
};
