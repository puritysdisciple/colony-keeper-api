import { DatabaseContext } from '../src/DataSources/DatabaseContext';
import { AlertDatabaseRepository } from '../src/Repositories/AlertDatabaseRepository';
import { ApiaryDatabaseRepository } from '../src/Repositories/ApiaryDatabaseRepository';
import { HiveDatabaseRepository } from '../src/Repositories/HiveDatabaseRepository';
import { UserDatabaseRepository } from '../src/Repositories/UserDatabaseRepository';
import { IContext } from '../src/Resolvers/IContext';

export async function createContext (): Promise<IContext> {
    await DatabaseContext.Instance().start();

    return {
        dataSources: {
            alert: new AlertDatabaseRepository(DatabaseContext.Instance()),
            apiary: new ApiaryDatabaseRepository(DatabaseContext.Instance()),
            hive: new HiveDatabaseRepository(DatabaseContext.Instance()),
            user: new UserDatabaseRepository(DatabaseContext.Instance()),
        },
    };
}
