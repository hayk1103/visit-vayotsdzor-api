'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('userInfo', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID
            },
            userId: {
                unique: true,
                onDelete: 'CASCADE',
                type: Sequelize.UUID,
                references: {
                    model: 'user',
                    key: 'id'
                }
            },
            bio: {
                type: Sequelize.TEXT
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
        await queryInterface.dropTable('userInfo', {});
    }
};
