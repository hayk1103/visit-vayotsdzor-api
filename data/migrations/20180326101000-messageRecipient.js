'use strict';

const _ = require('lodash');

const { RecipientStatus } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('messageRecipient', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID
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
            messageId: {
                allowNull: false,
                type: Sequelize.UUID,
                onDelete: 'CASCADE',
                references: {
                    model: 'message',
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
            status: {
                type: Sequelize.ENUM,
                values: _.values(RecipientStatus),
                defaultValue: RecipientStatus.PUBLISHED
            },
            isSeen: {
                defaultValue: false,
                type: Sequelize.BOOLEAN
            },
            isRead: {
                defaultValue: false,
                type: Sequelize.BOOLEAN
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
        await queryInterface.dropTable('messageRecipient', {});
    }
};
