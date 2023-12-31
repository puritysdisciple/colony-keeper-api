import { IAlert, IApiary, IHive, IUser } from '../../colony-keeper-core/src';
import { IContext } from '../src/Resolvers/IContext';

import { createContext } from './createContext';

interface IBaseTestRepository<TType> {
    save(entity: TType): Promise<TType>;

    destroy(entity: TType): Promise<void>;
}

type ITestFactory<TType> = (entity: TType) => Promise<TType>;
type ITestDestructor = () => Promise<void>;
type ITestModelFixture<TType> = [ITestFactory<TType>, ITestDestructor];

function createTestFactory<TType> (repository: IBaseTestRepository<TType>): ITestModelFixture<TType> {
    const models: TType[] = [];

    async function create (entity: TType): Promise<TType> {
        const newModel: TType = await repository.save(entity);

        models.push(newModel);

        return newModel;
    }

    async function destroy (): Promise<void> {
        for (let i: number = 0; i < models.length; i = i + 1) {
            await repository.destroy(models[i]);
        }
    }

    return [create, destroy];
}

export class TestFixture {
    public context: IContext;
    private _factories: {
        alert: ITestFactory<IAlert>;
        apiary: ITestFactory<IApiary>;
        hive: ITestFactory<IHive>;
        user: ITestFactory<IUser>;
    };
    private _destructors: {
        alert: ITestDestructor;
        apiary: ITestDestructor;
        hive: ITestDestructor;
        user: ITestDestructor;
    };

    public async setup (): Promise<void> {
        this.context = await createContext();

        const [createAlert, destroyAlerts]: ITestModelFixture<IAlert> = createTestFactory(this.context.dataSources.alert);
        const [createApiary, destroyApiaries]: ITestModelFixture<IApiary> = createTestFactory(this.context.dataSources.apiary);
        const [createHive, destroyHives]: ITestModelFixture<IHive> = createTestFactory(this.context.dataSources.hive);
        const [createUser, destroyUsers]: ITestModelFixture<IUser> = createTestFactory(this.context.dataSources.user);

        this._factories = {
            alert: createAlert,
            apiary: createApiary,
            hive: createHive,
            user: createUser,
        };

        this._destructors = {
            alert: destroyAlerts,
            apiary: destroyApiaries,
            hive: destroyHives,
            user: destroyUsers,
        };
    }

    public async teardown (): Promise<void> {
        await this._destructors.alert();
        await this._destructors.hive();
        await this._destructors.apiary();
        await this._destructors.user();
    }

    public async createAlert (alert: IAlert): Promise<IAlert> {
        return this._factories.alert(alert);
    }

    public async createApiary (apiary: IApiary): Promise<IApiary> {
        return this._factories.apiary(apiary);
    }

    public async createHive (hive: IHive): Promise<IHive> {
        return this._factories.hive(hive);
    }

    public async createUser (user: IUser): Promise<IUser> {
        return this._factories.user(user);
    }
}
