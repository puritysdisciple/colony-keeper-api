import { createApiaryResolver, createApiarySchema } from './createApiary';
import { viewApiaryDetailsResolver, viewApiaryDetailsSchema } from './viewApiaryDetails';
import { viewApiaryListResolver, viewApiaryListSchema } from './viewApiaryList';

export const schema: string[] = [viewApiaryDetailsSchema, viewApiaryListSchema, createApiarySchema];

export const resolvers: Record<string, any> = {
    Query: {
        viewApiaryList: viewApiaryListResolver,
        viewApiaryDetails: viewApiaryDetailsResolver,
    },
    Mutation: {
        createApiary: createApiaryResolver,
    },
};
