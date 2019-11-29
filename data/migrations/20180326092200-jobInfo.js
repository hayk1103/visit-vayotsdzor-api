'use strict';

const _ = require('lodash');

const { JobInfoType } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('jobInfo', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID
            },
            jobId: {
                allowNull: false,
                onDelete: 'CASCADE',
                type: Sequelize.UUID,
                references: {
                    model: 'job',
                    key: 'id'
                }
            },
            value: {
                allowNull: false,
                type: Sequelize.TEXT
            },
            type: {
                type: Sequelize.ENUM,
                values: _.values(JobInfoType)
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
        await queryInterface.dropTable('jobInfo', {});
    }
};
