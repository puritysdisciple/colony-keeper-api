'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('Readings', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            timestamp: {
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                type: Sequelize.DATE,
            },
            type: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            value: {
                allowNull: false,
                type: Sequelize.FLOAT,
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
            boxId: {
                allowNull: true,
                type: Sequelize.UUID,
                references: {
                    model: {
                        tableName: 'Boxes',
                        schema: 'public',
                    },
                    key: 'id',
                },
            },
            sensorId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: {
                        tableName: 'Sensors',
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
        await queryInterface.dropTable('Readings');
    },
};
