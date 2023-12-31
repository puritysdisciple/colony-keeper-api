import { Box } from 'colony-keeper-core';
import { IBoxRepository } from 'colony-keeper-use-cases';

import { DatabaseContext } from '../DataSources/DatabaseContext';

import { BoxModel } from './Models/BoxModel';

export class BoxDatabaseRepository implements IBoxRepository {
    private _context: DatabaseContext;

    public constructor (databaseContext: DatabaseContext) {
        this._context = databaseContext;
    }

    public async save (box: Box): Promise<Box> {
        const newBox: BoxModel = this._context.models.box.buildFromBox(box);

        await newBox.save();

        return box;
    }

    public async findAllByHiveId (hiveId: string): Promise<Box[]> {
        const models: BoxModel[] = await this._context.models.box.findAll({
            where: {
                hiveId: hiveId,
            },
            order: [
                ['sortOrder', 'ASC'],
            ],
        });

        return models.map((model: BoxModel): Box => {
            return model.toBox();
        });
    }
}

