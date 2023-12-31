import { Alert, IAlertType } from 'colony-keeper-core';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface IAlertModelAttributes {
    id: string;
    hiveId: string;
    type: IAlertType;
}

export class AlertModel extends Model<IAlertModelAttributes> {
    declare public id: string;
    declare public hiveId: string;
    declare public type: IAlertType;

    public static associate (models: any): void {
        this.belongsTo(models.Hive);
    }

    public static buildFromAlert (alert: Alert): AlertModel {
        return AlertModel.build({
            id: alert.id,
            hiveId: alert.hiveId,
            type: alert.type,
        });
    }

    public toAlert (): Alert {
        return Alert.create({
            id: this.id,
            hiveId: this.hiveId,
            type: this.type,
        });
    }
}

export function createAlertModel (sequelize: Sequelize): typeof AlertModel {
    AlertModel.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        type: DataTypes.STRING,
        hiveId: DataTypes.UUID,
    }, {
        sequelize: sequelize,
        modelName: 'Alert',
    });

    return AlertModel;
}
