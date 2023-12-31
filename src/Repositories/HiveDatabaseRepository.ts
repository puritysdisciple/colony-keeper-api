import { Hive, INullable } from 'colony-keeper-core';
import { IHiveRepository } from 'colony-keeper-use-cases';

import { DatabaseContext } from '../DataSources/DatabaseContext';

import { HiveModel } from './Models/HiveModel';

export class HiveDatabaseRepository implements IHiveRepository {
    private _context: DatabaseContext;

    public constructor (databaseContext: DatabaseContext) {
        this._context = databaseContext;
    }

    public async findById (hiveId: string): Promise<Hive> {
        const model: INullable<HiveModel> = await this._context.models.hive.findByPk(hiveId);

        if (!model) {
            return null;
        }

        return model.toHive();
    }

    public async findBySensor (sensorId: string): Promise<Hive> {
        throw new Error('Method not implemented.');
    }

    public async findAllByApiaryId (apiaryId: string): Promise<Hive[]> {
        const models: HiveModel[] = await this._context.models.hive.findAll({
            where: {
                apiaryId: apiaryId,
            },
        });

        return models.map((model: HiveModel): Hive => {
            return model.toHive();
        });
    }

    public async save (hive: Hive): Promise<Hive> {
        const newHive: any = this._context.models.hive.buildFromHive(hive);

        await newHive.save();

        return hive;
    }

    public async destroy (hive: Hive): Promise<void> {
        await this._context.models.hive.destroy({
            where: {
                id: hive.id,
            },
        });
    }
}
