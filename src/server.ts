import { ApolloServer } from '@apollo/server';
import { GraphQLServerListener } from '@apollo/server/src/externalTypes/plugins';

import { DatabaseContext } from './DataSources/DatabaseContext';
import { resolvers as apiaryResolvers, schema as apiarySchema } from './Resolvers/Apiary';
import { resolvers as dataPointResolvers, schema as dataPointSchema } from './Resolvers/DataPoint';
import { resolvers as hiveResolvers, schema as hiveSchema } from './Resolvers/Hive';
import { IContext } from './Resolvers/IContext';
import { resolvers as userResolvers, schema as userSchema } from './Resolvers/User';

function mergeResolvers (resolvers: Record<string, any>[]): Record<string, any> {
    const base: Record<string, any> = {};

    resolvers.forEach((resolver: Record<string, any>): void => {
        Object.keys(resolver).forEach((key: string): void => {
            if (!base[key]) {
                base[key] = {};
            }

            base[key] = {
                ...base[key],
                ...resolver[key],
            };
        });
    });

    return base;
}

const typeDefs: string = `
    type ValidationError {
        key: String!
        message: String!
    }

    type Query {
        _empty: String!
    }
    
    type MutationError {
        message: String!
    }
    
    type Mutation {
        _empty: String!
    }
`;

export const server: ApolloServer<IContext> = new ApolloServer<IContext>({
    typeDefs: [typeDefs, userSchema, apiarySchema, hiveSchema, dataPointSchema],
    resolvers: mergeResolvers([userResolvers, apiaryResolvers, hiveResolvers, dataPointResolvers]),
    plugins: [
        {
            serverWillStart: async (): Promise<GraphQLServerListener> => {
                return {
                    serverWillStop: async (): Promise<void> => {
                        await DatabaseContext.Instance().end();
                    },
                };
            },
        },
    ],
});
