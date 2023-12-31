import { Frame } from 'colony-keeper-core';
import { DataTypes, HasManyGetAssociationsMixin, Model, Sequelize } from 'sequelize';

import { SensorModel } from './SensorModel';

interface IFrameModelAttributes {
    id: string;
    index: number;
    boxId: string;
}

export class FrameModel extends Model<IFrameModelAttributes> {
    declare public id: string;
    declare public index: number;
    declare public boxId: string;

    declare public getStartSensors: HasManyGetAssociationsMixin<SensorModel>;
    declare public getEndSensors: HasManyGetAssociationsMixin<SensorModel>;

    public static associate (models: any): void {
        this.belongsTo(models.Box);
        this.hasMany(models.Sensor, {
            as: 'startSensors',
            foreignKey: 'startFrameId',
        });
        this.hasMany(models.Sensor, {
            as: 'endSensors',
            foreignKey: 'endFrameId',
        });
    }

    public static buildFromFrame (frame: Frame): FrameModel {
        return FrameModel.build({
            id: frame.id,
            index: frame.index,
            boxId: frame.boxId,
        });
    }

    public toFrame (): Frame {
        return Frame.create({
            id: this.id,
            index: this.index,
            boxId: this.boxId,
        });
    }

    public async getSensors (): Promise<any[]> {
        const results: any[] = await Promise.all([
            this.getStartSensors(),
            this.getEndSensors(),
        ]);

        return [...results[0], ...results[1]];
    }
}

export function createFrameModel (sequelize: Sequelize): typeof FrameModel {
    FrameModel.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        index: DataTypes.INTEGER,
        boxId: DataTypes.UUID,
    }, {
        sequelize: sequelize,
        modelName: 'Frame',
    });

    return FrameModel;
}
