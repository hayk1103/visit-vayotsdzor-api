'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('skill', {
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
            name: {
                allowNull: false,
                type: Sequelize.STRING
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('skill', {});
    }
};
