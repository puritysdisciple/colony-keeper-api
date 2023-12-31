import { INullable, Reading } from 'colony-keeper-core';
import { IReadingRepository } from 'colony-keeper-use-cases';
import { QueryTypes } from 'sequelize';

import { DatabaseContext } from '../DataSources/DatabaseContext';

import { ReadingModel } from './Models/ReadingModel';

export class ReadingDatabaseRepository implements IReadingRepository {
    private _context: DatabaseContext;

    public constructor (databaseContext: DatabaseContext) {
        this._context = databaseContext;
    }

    public async findLatestBySensorId (sensorId: string): Promise<INullable<Reading>> {
        const model: INullable<ReadingModel> = await this._context.models.reading.findOne({
            where: {
                sensorId: sensorId,
            },
            order: [
                ['timestamp', 'DESC'],
            ],
        });

        if (!model) {
            return null;
        }

        return model.toReading();
    }

    public async findAllBySensorIdEvery30Minutes (sensorId: string, after: Date): Promise<Reading[]> {
        const [results]: any = await this._context.query(
            `
                SELECT
                    "hiveId",
                    "boxId",
                    "sensorId",
                    "type",
                    AVG(value) AS "value",
                    date_bin('30 minutes', "timestamp", date_trunc('day', "timestamp")) AS "timestamp"
                FROM public."Readings"
                WHERE "sensorId" = :sensorId
                AND "timestamp" >= :timestamp
                AND "type" != 'BATTERY_VOLTAGE'
                GROUP BY "hiveId", "boxId", "sensorId", "type", "timestamp"
                ORDER BY "timestamp" ASC;
            `,
            {
                replacements: {
                    sensorId: sensorId,
                    timestamp: after.toUTCString(),
                    type: QueryTypes.SELECT,
                },
            }
        );

        return results.map((row: any): Reading => {
            return Reading.create(row);
        });
    }

    public async findAllBySensorIdEveryDay (sensorId: string, after: Date): Promise<Reading[]> {
        const [results]: any = await this._context.query(
            `
                SELECT
                    "hiveId",
                    "boxId",
                    "sensorId",
                    "type",
                    AVG(value) AS "value",
                    date_bin('1 day', "timestamp", date_trunc('day', "timestamp")) AS "t"
                FROM public."Readings"
                WHERE "sensorId" = :sensorId
                AND "timestamp" >= :timestamp
                AND "type" != 'BATTERY_VOLTAGE'
                GROUP BY "hiveId", "boxId", "sensorId", "type", "t"
                ORDER BY "t" ASC;
            `,
            {
                replacements: {
                    sensorId: sensorId,
                    timestamp: after.toUTCString(),
                    type: QueryTypes.SELECT,
                },
            }
        );

        return results.map((row: any): Reading => {
            const timestamp: any = row.t;

            delete row.t;

            return Reading.create({
                ...row,
                timestamp: timestamp,
            });
        });
    }

    public async createReading (reading: Reading): Promise<Reading> {
        const readingModel: ReadingModel = this._context.models.reading.buildFromReading(reading);

        return readingModel.save().then((model: ReadingModel): Reading => {
            return model.toReading();
        });
    }
}
