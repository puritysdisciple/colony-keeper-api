import { IDataType, INullable, User } from 'colony-keeper-core';
import { Sequelize, Model, DataTypes } from 'sequelize';

interface IUserModelAttributes {
    id: string;
    email: string;
    phone: string;
    password: string;
}

export class UserModel extends Model<IUserModelAttributes> {
    declare public id: string;
    declare public email: string;
    declare public phone: string;
    declare public password: string;

    public static associate (models: any): void {
        this.hasMany(models.Apiary);
        this.hasMany(models.Device);
    }

    public static buildFromUser (user: User): UserModel {
        return UserModel.build({
            id: user.id,
            email: user.email,
            phone: user.phone,
        });
    }

    public toUser (): User {
        return User.create({
            id: this.id,
            email: this.email,
            phone: this.phone,
        });
    }
}

export function createUserModel (sequelize: Sequelize): typeof UserModel {
    UserModel.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        password: DataTypes.STRING,
    }, {
        sequelize: sequelize,
        modelName: 'User',
    });

    return UserModel;
}
