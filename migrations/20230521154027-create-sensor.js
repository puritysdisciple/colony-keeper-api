'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('Sensors', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            ssid: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            type1: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            type2: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            deviceId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: {
                        tableName: 'Devices',
                        schema: 'public',
                    },
                    key: 'id',
                },
            },
            hiveId: {
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
                type: Sequelize.UUID,
                references: {
                    model: {
                        tableName: 'Boxes',
                        schema: 'public',
                    },
                    key: 'id',
                },
            },
            frameGapIndex: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            calibration: {
                type: Sequelize.FLOAT,
                allowNull: false,
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
        await queryInterface.dropTable('Sensors');
    },
};
