'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('education', {
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
            },
            degree: {
                type: Sequelize.STRING
            },
            date: {
                type: Sequelize.STRING
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('education', {});
    }
};
