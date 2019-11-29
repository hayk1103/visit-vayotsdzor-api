'use strict';

const _ = require('lodash');

const { UserStatus, GenderType, AccountType } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID
            },
            firstName: {
                allowNull: false,
                type: Sequelize.STRING(50)
            },
            lastName: {
                allowNull: false,
                type: Sequelize.STRING(50)
            },
            email: {
                unique: true,
                allowNull: false,
                type: Sequelize.STRING
            },
            phone: {
                unique: true,
                type: Sequelize.STRING
            },
            avatar: {
                type: Sequelize.STRING
            },
            dob: {
                type: Sequelize.DATEONLY
            },
            password: {
                allowNull: false,
                type: Sequelize.STRING
            },
            accessTokenSalt: {
                allowNull: false,
                type: Sequelize.STRING
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: _.values(UserStatus)
            },
            gender: {
                type: Sequelize.ENUM,
                values: _.values(GenderType)
            },
            accountType: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: _.values(AccountType)
            },
            forgotPasswordCode: {
                type: Sequelize.INTEGER
            },
            activationCode: {
                type: Sequelize.INTEGER
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
        await queryInterface.dropTable('user', {});
    }
};
