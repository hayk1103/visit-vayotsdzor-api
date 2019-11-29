'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('location', {
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
            jobId: {
                unique: true,
                onDelete: 'CASCADE',
                type: Sequelize.UUID,
                references: {
                    model: 'job',
                    key: 'id'
                }
            },
            country: {
                type: Sequelize.STRING
            },
            city: {
                type: Sequelize.STRING
            },
            state: {
                type: Sequelize.STRING
            },
            secondAddress: {
                type: Sequelize.STRING
            },
            zipCode: {
                type: Sequelize.STRING
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
        await queryInterface.dropTable('location', {});
    }
};
