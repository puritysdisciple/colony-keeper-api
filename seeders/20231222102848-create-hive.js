'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async function (queryInterface, Sequelize) {
        const userId = '70da011d-2021-4988-a188-c57e880477ad';
        const apiaryId = '0ea35c62-7ea7-49e9-95af-ea999b6bc458';
        const hiveName = 'Hive 12';
        const hiveId = uuidv4();
        const now = (new Date()).toUTCString();

        await queryInterface.bulkInsert('Hives', [{
            id: hiveId,
            name: hiveName,
            apiaryId: apiaryId,
            createdAt: now,
            updatedAt: now,
        }]);

        const boxId = uuidv4();

        await queryInterface.bulkInsert('Boxes', [{
            id: boxId,
            frameCount: 10,
            type: 'DEEP',
            hiveId: hiveId,
            sortOrder: 0,
            createdAt: now,
            updatedAt: now,
        }]);

        const deviceId = uuidv4();

        await queryInterface.bulkInsert('Devices', [{
            id: deviceId,
            userId: userId,
            apiaryId: apiaryId,
            boxId: boxId,
            hiveId: hiveId,
            createdAt: now,
            updatedAt: now,
        }]);

        console.log('hiveId: ' + hiveId);
        console.log('boxId: ' + boxId);
        console.log('deviceId: ' + deviceId);
    },

    down: async function (queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
