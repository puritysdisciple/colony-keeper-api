import { Device, INullable } from 'colony-keeper-core';
import { IDeviceRepository } from 'colony-keeper-use-cases';

import { DatabaseContext } from '../DataSources/DatabaseContext';

import { DeviceModel } from './Models/DeviceModel';

export class DeviceDatabaseRepository implements IDeviceRepository {
    private _context: DatabaseContext;

    public constructor (databaseContext: DatabaseContext) {
        this._context = databaseContext;
    }

    public async findBySerial (serial: string): Promise<INullable<Device>> {
        const model: INullable<DeviceModel> = await this._context.models.device.findOne({
            where: {
                serial: serial,
            },
        });

        if (!model) {
            return;
        }

        return model.toDevice();
    }

    public async save (device: Device): Promise<Device> {
        const newDevice: DeviceModel = this._context.models.device.buildFromDevice(device);

        await newDevice.save();

        return device;
    }
}
