import { IDataType, INullable, Reading } from 'colony-keeper-core';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface IReadingModelAttributes {
    id: string;
    hiveId: string;
    boxId: INullable<string>;
    sensorId: string;
    type: IDataType;
    value: number;
    timestamp: Date;
}

export class ReadingModel extends Model<IReadingModelAttributes> {
    declare public id: string;
    declare public hiveId: string;
    declare public boxId: INullable<string>;
    declare public sensorId: string;
    declare public type: IDataType;
    declare public value: number;
    declare public timestamp: Date;

    public static associate (models: any): void {
        this.belongsTo(models.Sensor);
    }

    public static buildFromReading (reading: Reading): ReadingModel {
        return ReadingModel.build({
            id: reading.id,
            hiveId: reading.hiveId,
            sensorId: reading.sensorId,
            boxId: reading.boxId,
            type: reading.type,
            value: reading.value,
            timestamp: reading.timestamp,
        });
    }

    public toReading (): Reading {
        return Reading.create({
            id: this.id,
            sensorId: this.sensorId,
            hiveId: this.hiveId,
            boxId: this.boxId,
            type: this.type,
            value: this.value,
            timestamp: this.timestamp,
        });
    }
}

export function createReadingModel (sequelize: Sequelize): typeof ReadingModel {
    ReadingModel.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        timestamp: DataTypes.DATE,
        type: DataTypes.STRING,
        value: DataTypes.FLOAT,
        sensorId: DataTypes.UUID,
        hiveId: DataTypes.UUID,
        boxId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    }, {
        sequelize: sequelize,
        modelName: 'Reading',
    });

    return ReadingModel;
}
