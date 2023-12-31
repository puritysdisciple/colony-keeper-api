'use strict';

const { parse } = require('csv-parse');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (t) => {
            const hiveId = '81924f06-f253-4010-8c4e-cf2e69aabc1e';
            const boxId = 'ab41da78-eff3-4b9b-95e3-2eb348ea186f';
            const deviceId = '7342d996-d488-44e1-9a7f-fda0a7486628';
            const now = (new Date()).toUTCString();

            const sensorParser = fs.createReadStream(__dirname + '/hive-12-sensors.csv')
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

            const dataParser = fs.createReadStream(__dirname + '/hive-12-data.csv')
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
