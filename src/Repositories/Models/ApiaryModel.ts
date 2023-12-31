import { Apiary, ILocation, INullable } from 'colony-keeper-core';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface IApiaryModelAttributes {
    id: string;
    name: string;
    userId: string;
    location: string;
}

export class ApiaryModel extends Model<IApiaryModelAttributes> {
    declare public id: string;
    declare public name: string;
    declare public userId: string;
    declare public location: string;

    public static associate (models: any): void {
        this.belongsTo(models.User);
        this.hasMany(models.Hive);
    }

    public static buildFromApiary (apiary: Apiary): ApiaryModel {
        let location: string = '';

        if (apiary.location) {
            location = `${apiary.location.latitude}, ${apiary.location.longitude}`;
        }

        return ApiaryModel.build({
            id: apiary.id,
            name: apiary.name,
            location: location,
            userId: apiary.userId,
        });
    }

    public toApiary (): Apiary {
        let location: INullable<ILocation> = null;

        if (this.location.length) {
            const [latitude, longitude]: string[] = this.location.split(', ');

            location = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            };
        }

        return Apiary.create({
            id: this.id,
            name: this.name,
            userId: this.userId,
            location: location,
        });
    }
}

export function createApiaryModel (sequelize: Sequelize): typeof ApiaryModel {
    ApiaryModel.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name: DataTypes.STRING,
        location: DataTypes.STRING,
        userId: DataTypes.UUID,
    }, {
        sequelize: sequelize,
        modelName: 'Apiary',
    });

    return ApiaryModel;
}
