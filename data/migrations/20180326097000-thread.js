'use strict';

const _ = require('lodash');

const { ThreadType } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('thread', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID
            },
            type: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: _.values(ThreadType)
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
    },

    async down(queryInterface) {
        await queryInterface.dropTable('thread', {});
    }
};
