'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('message', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID
            },
            text: {
                type: Sequelize.TEXT
            },
            threadId: {
                allowNull: false,
                type: Sequelize.UUID,
                onDelete: 'CASCADE',
                references: {
                    model: 'thread',
                    key: 'id'
                }
            },
            userId: {
                allowNull: false,
                type: Sequelize.UUID,
                onDelete: 'CASCADE',
                references: {
                    model: 'user',
                    key: 'id'
                }
            },
            index: {
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
        await queryInterface.dropTable('message', {});
    }
};
