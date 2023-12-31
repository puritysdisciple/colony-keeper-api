import { INullable , Apiary } from 'colony-keeper-core';
import { IApiaryRepository } from 'colony-keeper-use-cases';

import { DatabaseContext } from '../DataSources/DatabaseContext';

import { ApiaryModel } from './Models/ApiaryModel';

export class ApiaryDatabaseRepository implements IApiaryRepository {
    private _context: DatabaseContext;

    public constructor (databaseContext: DatabaseContext) {
        this._context = databaseContext;
    }

    public async findById (apiaryId: string): Promise<INullable<Apiary>> {
        const model: INullable<ApiaryModel> = await this._context.models.apiary.findByPk(apiaryId);

        if (!model) {
            return null;
        }

        return model.toApiary();
    }

    public async findAllByUserId (userId: string): Promise<Apiary[]> {
        const models: ApiaryModel[] = await this._context.models.apiary.findAll({
            where: {
                userId: userId,
            },
        });

        return models.map((model: ApiaryModel): Apiary => {
            return model.toApiary();
        });
    }

    public async save (apiary: Apiary): Promise<Apiary> {
        const newApiary: ApiaryModel = this._context.models.apiary.buildFromApiary(apiary);

        await newApiary.save();

        return apiary;
    }

    public async destroy (apiary: Apiary): Promise<void> {
        await this._context.models.apiary.destroy({
            where: {
                id: apiary.id,
            },
        });
    }
}
