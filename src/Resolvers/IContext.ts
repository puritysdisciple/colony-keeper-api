import type { BaseContext } from '@apollo/server';
import type { INullable, IUser } from 'colony-keeper-core';
import type { IAlertRepository, IApiaryRepository, IBoxRepository, IDeviceRepository, IFrameRepository, IHiveRepository, IReadingRepository, ISensorRepository, IUserRepository } from 'colony-keeper-use-cases';

export interface IContext extends BaseContext {
    currentUser: INullable<IUser>;
    dataSources: {
        alert: IAlertRepository;
        apiary: IApiaryRepository;
        box: IBoxRepository;
        device: IDeviceRepository;
        frame: IFrameRepository;
        hive: IHiveRepository;
        reading: IReadingRepository;
        sensor: ISensorRepository;
        user: IUserRepository;
    };
}
