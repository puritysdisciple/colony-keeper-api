import { handlers, startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda';
import { LambdaHandler } from '@as-integrations/aws-lambda/src/lambdaHandler';
import { INullable, IUser } from 'colony-keeper-core';
import { IUserRepository } from 'colony-keeper-use-cases';

import { DatabaseContext } from './DataSources/DatabaseContext';
import { AlertDatabaseRepository } from './Repositories/AlertDatabaseRepository';
import { ApiaryDatabaseRepository } from './Repositories/ApiaryDatabaseRepository';
import { BoxDatabaseRepository } from './Repositories/BoxDatabaseRepository';
import { DeviceDatabaseRepository } from './Repositories/DeviceDatabaseRepository';
import { FrameDatabaseRepository } from './Repositories/FrameDatabaseRepository';
import { HiveDatabaseRepository } from './Repositories/HiveDatabaseRepository';
import { ReadingDatabaseRepository } from './Repositories/ReadingDatabaseRepository';
import { SensorDatabaseRepository } from './Repositories/SensorDatabaseRepository';
import { UserDatabaseRepository } from './Repositories/UserDatabaseRepository';
import { server } from './server';

export const graphqlHandler: LambdaHandler<any> = startServerAndCreateLambdaHandler(
    server,
    // We will be using the Proxy V2 handler
    handlers.createAPIGatewayProxyEventV2RequestHandler(),
    {
        context: async ({ event, context }: any): Promise<any> => {
            let user: INullable<IUser> = null;

            await DatabaseContext.Instance().start();

            const userRepository: IUserRepository = new UserDatabaseRepository(DatabaseContext.Instance());

            if (event.headers.authorization) {
                const parts: string[] = event.headers.authorization.split(' ');

                if (parts[0] !== 'Bearer') {
                    throw new Error('Malformed authorization');
                }

                user = await userRepository.findByToken(parts[1]);
            }

            return {
                currentUser: user,
                dataSources: {
                    alert: new AlertDatabaseRepository(DatabaseContext.Instance()),
                    apiary: new ApiaryDatabaseRepository(DatabaseContext.Instance()),
                    box: new BoxDatabaseRepository(DatabaseContext.Instance()),
                    device: new DeviceDatabaseRepository(DatabaseContext.Instance()),
                    frame: new FrameDatabaseRepository(DatabaseContext.Instance()),
                    hive: new HiveDatabaseRepository(DatabaseContext.Instance()),
                    reading: new ReadingDatabaseRepository(DatabaseContext.Instance()),
                    sensor: new SensorDatabaseRepository(DatabaseContext.Instance()),
                    user: userRepository,
                },
            };
        },
    }
);
