'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('category', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID
            },
            title: {
                unique: true,
                allowNull: false,
                type: Sequelize.STRING(50)
            },
            alias: {
                unique: true,
                allowNull: false,
                type: Sequelize.STRING(50)
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('category', {});
    }
};
