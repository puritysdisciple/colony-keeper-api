'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('Hives', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            apiaryId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: {
                        tableName: 'Apiaries',
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
        await queryInterface.dropTable('Hives');
    },
};
