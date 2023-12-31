'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('Alerts', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            hiveId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: {
                        tableName: 'Hives',
                        schema: 'public',
                    },
                    key: 'id',
                },
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.dropTable('Alerts');
    },
};
