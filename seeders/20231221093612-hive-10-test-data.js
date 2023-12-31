'use strict';

const { parse } = require('csv-parse');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (t) => {
            const hiveId = 'ccabb5f3-15e1-4521-bcff-14c74aae0606';
            const boxId = '361d1f14-b3f0-452a-9e6b-4c3121b068c2';
            const deviceId = '92762f48-77c1-477d-a53e-5708a508a035';
            const now = (new Date()).toUTCString();

            const sensorParser = fs.createReadStream(__dirname + '/hive-10-sensors.csv')
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
                let frameGapIndex = parseInt(row[3].replace('gap', ''), 10);

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

            const dataParser = fs.createReadStream(__dirname + '/hive-10-data.csv')
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
