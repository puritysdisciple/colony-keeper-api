'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('Apiaries', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            location: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            userId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: {
                        tableName: 'Users',
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
        await queryInterface.dropTable('Apiaries');
    },
};
