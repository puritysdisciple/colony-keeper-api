import { createHiveResolver, createHiveSchema } from './createHive';
import { viewHiveDetailsResolver, viewHiveDetailsSchema } from './viewHiveDetails';

export const schema: string[] = [viewHiveDetailsSchema, createHiveSchema];

export const resolvers: Record<string, any> = {
    Query: {
        viewHiveDetails: viewHiveDetailsResolver,
    },
    Mutation: {
        createHive: createHiveResolver,
    },
};
