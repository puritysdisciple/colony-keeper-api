import { IDataType, INullable, User } from 'colony-keeper-core';
import { Sequelize, Model, DataTypes } from 'sequelize';

interface ISessionModelAttributes {
    id: string;
    email: string;
}

export class SessionModel extends Model<ISessionModelAttributes> {
    declare public id: string;
    declare public email: string;
}

export function createSessionModel (sequelize: Sequelize): typeof SessionModel {
    SessionModel.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        email: DataTypes.STRING,
    }, {
        sequelize: sequelize,
        modelName: 'Session',
    });

    return SessionModel;
}
