'use strict';

const _ = require('lodash');

const { JobType, JobCategory } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('job', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID
            },
            userId: {
                onDelete: 'CASCADE',
                type: Sequelize.UUID,
                references: {
                    model: 'user',
                    key: 'id'
                }
            },
            categoryId: {
                allowNull: false,
                onDelete: 'CASCADE',
                type: Sequelize.UUID,
                references: {
                    model: 'category',
                    key: 'id'
                }
            },
            title: {
                allowNull: false,
                type: Sequelize.STRING
            },
            description: {
                allowNull: false,
                type: Sequelize.TEXT
            },
            type: {
                type: Sequelize.ENUM,
                values: _.values(JobType)
            },
            vacancy: {
                type: Sequelize.INTEGER
            },
            gender: {
                type: Sequelize.ENUM,
                values: _.values(JobCategory)
            },
            salary: {
                type: Sequelize.STRING
            },
            deadline: {
                type: Sequelize.DATEONLY
            },
            logo:{
                type: Sequelize.STRING
            },
            isArchived: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
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
        await queryInterface.dropTable('job', {});
    }
};
