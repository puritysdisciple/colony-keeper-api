import { startStandaloneServer } from '@apollo/server/standalone';
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
import { IContext } from './Resolvers/IContext';
import { server } from './server';

import { IncomingMessage, OutgoingMessage } from 'http';

startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async (args: { req: IncomingMessage; res: OutgoingMessage }): Promise<IContext> => {
        const { req }: { req: IncomingMessage; res: OutgoingMessage } = args;
        let user: INullable<IUser> = null;

        await DatabaseContext.Instance().start();

        const userRepository: IUserRepository = new UserDatabaseRepository(DatabaseContext.Instance());

        if (req.headers.authorization) {
            const parts: string[] = req.headers.authorization.split(' ');

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
}).then((result: { url: string }): void => {
    const { url }: { url: string } = result;

    console.log(`Server ready at: ${url}`);
});

