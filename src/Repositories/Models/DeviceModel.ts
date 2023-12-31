import { Device, INullable } from 'colony-keeper-core';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface IDeviceModelAttribute {
    id: string;
    serial: string;
    userId: string;
    apiaryId: string;
    hiveId: INullable<string>;
    boxId: INullable<string>;
}

export class DeviceModel extends Model<IDeviceModelAttribute> {
    declare public id: string;
    declare public serial: string;
    declare public userId: string;
    declare public apiaryId: string;
    declare public hiveId: INullable<string>;
    declare public boxId: INullable<string>;

    public static associate (models: any): void {
        this.belongsTo(models.User);
        this.belongsTo(models.Hive);
        this.hasMany(models.Sensor);
    }

    public static buildFromDevice (device: Device): DeviceModel {
        return DeviceModel.build({
            id: device.id,
            serial: device.serial,
            userId: device.userId,
            apiaryId: device.apiaryId,
            hiveId: device.hiveId,
            boxId: device.boxId,
        });
    }

    public toDevice (): Device {
        return Device.create({
            id: this.id,
            serial: this.serial,
            userId: this.userId,
            apiaryId: this.apiaryId,
            hiveId: this.hiveId,
            boxId: this.boxId,
        });
    }
}

export function createDeviceModel (sequelize: Sequelize): typeof DeviceModel {
    DeviceModel.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        serial: DataTypes.UUID,
        userId: DataTypes.UUID,
        apiaryId: DataTypes.UUID,
        hiveId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        boxId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    }, {
        sequelize: sequelize,
        modelName: 'Device',
    });

    return DeviceModel;
}
