import { createDataPointResolver, createDataPointSchema } from './createDataPointResolver';
import { dataPointSchema } from './dataPoint';

export const schema: string[] = [createDataPointSchema, dataPointSchema];

export const resolvers: Record<string, any> = {
    Mutation: {
        createDataPoint: createDataPointResolver,
    },
};
