'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('Devices', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
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
            apiaryId: {
                type: Sequelize.UUID,
                references: {
                    model: {
                        tableName: 'Apiaries',
                        schema: 'public',
                    },
                    key: 'id',
                },
            },
            boxId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: {
                        tableName: 'Boxes',
                        schema: 'public',
                    },
                    key: 'id',
                },
            },
            hiveId: {
                type: Sequelize.UUID,
                allowNull: true,
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
        await queryInterface.dropTable('Devices');
    },
};
