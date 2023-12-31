import { Hive } from 'colony-keeper-core';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface IHiveModelAttributes {
    id: string;
    name: string;
    apiaryId: string;
}

export class HiveModel extends Model<IHiveModelAttributes> {
    declare public id: string;
    declare public name: string;
    declare public apiaryId: string;

    public static associate (models: any): void {
        this.belongsTo(models.Apiary);
        this.hasMany(models.Box);
        this.hasMany(models.Device);
        this.hasMany(models.Sensor);
        this.hasMany(models.Alert);
    }

    public static buildFromHive (hive: Hive): HiveModel {
        return HiveModel.build({
            id: hive.id,
            apiaryId: hive.apiaryId,
            name: hive.name,
        });
    }

    public toHive (): Hive {
        return Hive.create({
            id: this.id,
            apiaryId: this.apiaryId,
            name: this.name,
        });
    }
}

export function createHiveModel (sequelize: Sequelize): typeof HiveModel {
    HiveModel.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        name: DataTypes.STRING,
        apiaryId: DataTypes.UUID,
    }, {
        sequelize: sequelize,
        modelName: 'Hive',
    });

    return HiveModel;
}
