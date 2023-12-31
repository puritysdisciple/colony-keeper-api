import { Box, IBoxType } from 'colony-keeper-core';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface IBoxModelAttributes {
    id: string;
    frameCount: number;
    hiveId: string;
    type: IBoxType;
    sortOrder: number;
}

export class BoxModel extends Model<IBoxModelAttributes> {
    declare public id: string;
    declare public frameCount: number;
    declare public hiveId: string;
    declare public type: IBoxType;
    declare public sortOrder: number;

    public static associate (models: any): void {
        this.belongsTo(models.Hive);
        this.hasMany(models.Frame);
    }

    public static buildFromBox (box: Box): BoxModel {
        return BoxModel.build({
            id: box.id,
            frameCount: box.frameCount,
            hiveId: box.hiveId,
            type: box.type,
            sortOrder: box.sortOrder,
        });
    }

    public toBox (): Box {
        return Box.create({
            id: this.id,
            frameCount: this.frameCount,
            hiveId: this.hiveId,
            type: this.type,
            sortOrder: this.sortOrder,
        });
    }
}

export function createBoxModel (sequelize: Sequelize): typeof BoxModel {
    BoxModel.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        frameCount: DataTypes.INTEGER,
        type: DataTypes.STRING,
        hiveId: DataTypes.UUID,
        sortOrder: DataTypes.INTEGER,
    }, {
        sequelize: sequelize,
        modelName: 'Box',
    });

    return BoxModel;
}
