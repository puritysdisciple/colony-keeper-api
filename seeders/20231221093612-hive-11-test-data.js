'use strict';

const { parse } = require('csv-parse');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (t) => {
            const hiveId = 'd8155ca5-347a-4e9c-a0d4-10f56168d791';
            const boxId = '92d37b2d-8a8d-4e73-8d64-c625c8b60d79';
            const deviceId = '0084dce7-c6b2-49f0-a8d6-47dc1c78daf3';
            const now = (new Date()).toUTCString();

            const sensorParser = fs.createReadStream(__dirname + '/hive-11-sensors.csv')
                .pipe(parse({
                    delimiter: ',',
                    from_line: 2,
                }));

            const sensors = [];
            const sensorIds = {};

            for await (const row of sensorParser) {
                const id = uuidv4();
                const ssid = row[0];
                const type = row[2];
                const calibration = parseFloat(row[4]);
                let frameGapIndex = parseInt(row[3].replace('gap'), 10);

                if (isNaN(frameGapIndex)) {
                    frameGapIndex = null;
                } else {
                    frameGapIndex = frameGapIndex - 1;
                }

                sensorIds[ssid] = id;

                sensors.push({
                    id: id,
                    ssid: ssid,
                    type1: type,
                    type2: 'NONE',
                    deviceId: deviceId,
                    hiveId: hiveId,
                    boxId: boxId,
                    frameGapIndex: frameGapIndex,
                    createdAt: now,
                    updatedAt: now,
                    calibration: calibration,
                });
            }

            await queryInterface.bulkInsert('Sensors', sensors);

            const dataParser = fs.createReadStream(__dirname + '/hive-11-data.csv')
                .pipe(parse({
                    delimiter: ',',
                    from_line: 2,
                }));

            const readings = [];

            for await (const row of dataParser) {
                const id = uuidv4();
                const [ssid, type, value, createdAt] = row;

                readings.push({
                    id: id,
                    timestamp: createdAt,
                    type: type,
                    value: parseFloat(value),
                    sensorId: sensorIds[ssid],
                    createdAt: createdAt,
                    updatedAt: createdAt,
                    boxId: boxId,
                    hiveId: hiveId,
                });
            }

            await queryInterface.bulkInsert('Readings', readings);
        });
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
