'use strict';

const _ = require('lodash');

const { LanguagesType, LevelType } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('language', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID
            },
            userInfoId: {
                allowNull: false,
                onDelete: 'CASCADE',
                type: Sequelize.UUID,
                references: {
                    model: 'userInfo',
                    key: 'id'
                }
            },
            level: {
                type: Sequelize.ENUM,
                values: _.values(LevelType)
            },
            value: {
                type: Sequelize.ENUM,
                values: _.keys(LanguagesType)
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('language', {});
    }
};
