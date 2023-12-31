import pg from 'pg';
import { Sequelize } from 'sequelize';

import config from '../../config/config.json';
import { AlertModel, createAlertModel } from '../Repositories/Models/AlertModel';
import { ApiaryModel, createApiaryModel } from '../Repositories/Models/ApiaryModel';
import { BoxModel, createBoxModel } from '../Repositories/Models/BoxModel';
import { createDeviceModel, DeviceModel } from '../Repositories/Models/DeviceModel';
import { createFrameModel, FrameModel } from '../Repositories/Models/FrameModel';
import { createHiveModel, HiveModel } from '../Repositories/Models/HiveModel';
import { createReadingModel, ReadingModel } from '../Repositories/Models/ReadingModel';
import { createSensorModel, SensorModel } from '../Repositories/Models/SensorModel';
import { createSessionModel, SessionModel } from '../Repositories/Models/SessionModel';
import { createUserModel, UserModel } from '../Repositories/Models/UserModel';

interface IModels {
    alert: typeof AlertModel;
    apiary: typeof ApiaryModel;
    box: typeof BoxModel;
    device: typeof DeviceModel;
    frame: typeof FrameModel;
    hive: typeof HiveModel;
    reading: typeof ReadingModel;
    sensor: typeof SensorModel;
    session: typeof SessionModel;
    user: typeof UserModel;
}

export class DatabaseContext {
    private static _instance: DatabaseContext;

    public models: IModels;

    private _sequelize: Sequelize | null = null;
    private _isStarted: boolean = false;

    public static Instance (): DatabaseContext {
        if (!DatabaseContext._instance) {
            DatabaseContext._instance = new DatabaseContext();
        }

        return DatabaseContext._instance;
    }

    public async start (): Promise<void> {
        if (this._isStarted) {
            return;
        }

        if (this._sequelize) {
            this._sequelize.connectionManager.initPools();

            if (this._sequelize.connectionManager.hasOwnProperty('getConnection')) {
                delete this._sequelize.connectionManager.getConnection;
            }

            return;
        }

        const dbConfig: any = config[process.env.NODE_ENV || 'development'];

        this._sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: 'postgres',
            dialectModule: pg,
            logging: true,
            pool: {},
        });

        await this._sequelize.authenticate();

        await this._createModels();

        this._isStarted = true;
    }

    public async end (): Promise<void> {
        await this._sequelize.connectionManager.close();
    }

    public async query (query: string, params: any): Promise<any> {
        return this._sequelize.query(query, params);
    }

    private async _createModels (): Promise<void> {
        try {
            this.models = {
                alert: createAlertModel(this._sequelize),
                apiary: createApiaryModel(this._sequelize),
                box: createBoxModel(this._sequelize),
                device: createDeviceModel(this._sequelize),
                frame: createFrameModel(this._sequelize),
                hive: createHiveModel(this._sequelize),
                reading: createReadingModel(this._sequelize),
                sensor: createSensorModel(this._sequelize),
                session: createSessionModel(this._sequelize),
                user: createUserModel(this._sequelize),
            };
        } catch (e) {
            console.log(e);
        }
    }
}
