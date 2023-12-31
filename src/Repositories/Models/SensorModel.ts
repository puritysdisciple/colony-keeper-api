import { IDataType, INullable, Sensor } from 'colony-keeper-core';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface ISensorModelAttributes {
    id: string;
    ssid: string;
    type1: IDataType;
    type2: IDataType;
    deviceId: string;
    hiveId: string;
    boxId: INullable<string>;
    frameGapIndex: INullable<number>;
    calibration: number;
}

export class SensorModel extends Model<ISensorModelAttributes> {
    declare public id: string;
    declare public ssid: string;
    declare public type1: IDataType;
    declare public type2: IDataType;
    declare public deviceId: string;
    declare public hiveId: string;
    declare public boxId: INullable<string>;
    declare public frameGapIndex: INullable<number>;
    declare public calibration: number;

    public static associate (models: any): void {
        this.belongsTo(models.Frame, {
            as: 'startFrame',
        });
        this.belongsTo(models.Frame, {
            as: 'endFrame',
        });
        this.hasMany(models.Reading);
    }

    public static buildFromSensor (sensor: Sensor): SensorModel {
        return SensorModel.build({
            id: sensor.id,
            ssid: sensor.ssid,
            type1: sensor.type1,
            type2: sensor.type2,
            deviceId: sensor.deviceId,
            hiveId: sensor.hiveId,
            boxId: sensor.boxId,
            frameGapIndex: sensor.frameGapIndex,
            calibration: sensor.calibration,
        });
    }

    public toSensor (): Sensor {
        return Sensor.create({
            id: this.id,
            ssid: this.ssid,
            type1: this.type1,
            type2: this.type2,
            deviceId: this.deviceId,
            hiveId: this.hiveId,
            boxId: this.boxId,
            frameGapIndex: this.frameGapIndex,
            calibration: this.calibration,
        });
    }
}

export function createSensorModel (sequelize: Sequelize): typeof SensorModel {
    SensorModel.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        ssid: DataTypes.STRING,
        type1: DataTypes.STRING,
        type2: DataTypes.STRING,
        deviceId: DataTypes.UUID,
        hiveId: DataTypes.UUID,
        boxId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        frameGapIndex: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        calibration: DataTypes.FLOAT,
    }, {
        sequelize: sequelize,
        modelName: 'Sensor',
    });

    return SensorModel;
}
