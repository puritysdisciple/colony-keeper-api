import { Alert } from 'colony-keeper-core';
import { IAlertRepository } from 'colony-keeper-use-cases';

import { DatabaseContext } from '../DataSources/DatabaseContext';

import { AlertModel } from './Models/AlertModel';

export class AlertDatabaseRepository implements IAlertRepository {
    private _context: DatabaseContext;

    public constructor (databaseContext: DatabaseContext) {
        this._context = databaseContext;
    }

    public async findAllByHiveId (hiveId: string): Promise<Alert[]> {
        const models: AlertModel[] = await this._context.models.alert.findAll({
            where: {
                hiveId: hiveId,
            },
        });

        return models.map((model: AlertModel): Alert => {
            return model.toAlert();
        });
    }

    public async save (alert: Alert): Promise<Alert> {
        const newAlert: AlertModel = this._context.models.alert.buildFromAlert(alert);

        await newAlert.save();

        return alert;
    }

    public async destroy (alert: Alert): Promise<void> {
        this._context.models.alert.destroy({
            where: {
                id: alert.id,
            },
        });
    }
}
