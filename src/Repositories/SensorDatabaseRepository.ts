import { INullable, Sensor } from 'colony-keeper-core';
import { ISensorRepository } from 'colony-keeper-use-cases';

import { DatabaseContext } from '../DataSources/DatabaseContext';

import { SensorModel } from './Models/SensorModel';

export class SensorDatabaseRepository implements ISensorRepository {
    private _context: DatabaseContext;

    public constructor (databaseContext: DatabaseContext) {
        this._context = databaseContext;
    }

    public async findAllByHiveId (hiveId: string): Promise<Sensor[]> {
        const models: SensorModel[] = await this._context.models.sensor.findAll({
            where: {
                hiveId: hiveId,
            },
        });

        return models.map((model: SensorModel): Sensor => {
            return model.toSensor();
        });
    }

    public async findAllByBoxId (boxId: string): Promise<Sensor[]> {
        const models: SensorModel[] = await this._context.models.sensor.findAll({
            where: {
                boxId: boxId,
            },
            order: [
                ['frameGapIndex', 'ASC'],
            ],
        });

        return models.map((model: SensorModel): Sensor => {
            return model.toSensor();
        });
    }

    public async findById (id: string): Promise<INullable<Sensor>> {
        const model: INullable<SensorModel> = await this._context.models.sensor.findOne({
            where: {
                id: id,
            },
        });

        if (!model) {
            return null;
        }

        return model.toSensor();
    }

    public async findBySsid (ssid: string): Promise<INullable<Sensor>> {
        const model: INullable<SensorModel> = await this._context.models.sensor.findOne({
            where: {
                ssid: ssid,
            },
        });

        if (!model) {
            return null;
        }

        return model.toSensor();
    }
}
