import { IReading } from 'colony-keeper-core';

import { IContext } from '../IContext';
import { IResolverInput } from '../IResolverInput';

import {
    ICreateDataPointsFromSensorReadingResult,
    CreateDataPointsFromSensorReading,
} from './CreateDataPointsFromSensorReading';

export const createDataPointSchema: string = `
    input CreateDataPointInput {
        sensorId: String!
        timestamp: Int!
        value1: Float!
        value2: Float
    }
    
    type CreateDataPointData {
        dataPoints: [DataPoint]!
    }
    
    type CreateDataPointResponse {
        success: Boolean!
        data: CreateDataPointData
        error: MutationError
    }
    
    extend type Mutation {
        createDataPoint(input: [CreateDataPointInput]!): CreateDataPointResponse!
    }
`;

type IMutationResult<TKey extends string, TType> = {
    success: true;
    data: {
        [key in TKey]: TType;
    };
    error: null;
} | {
    success: false;
    data: null;
    error: {
        message: string;
    };
};

interface ICreateDataPointResolverParams {
    sensorId: string;
    timestamp: number;
    value1: number;
    value2: number;
}

export async function createDataPointResolver (
    _: any,
    params: IResolverInput<ICreateDataPointResolverParams[]>,
    context: IContext
): Promise<IMutationResult<'dataPoints', IReading[]>> {
    const {
        dataSources: {
            reading: readingRepository,
            sensor: sensorRepository,
        },
    }: IContext = context;

    const inputs: ICreateDataPointResolverParams[] = params.input;

    const jobs: Promise<IReading[]>[] = inputs.map((input: ICreateDataPointResolverParams): Promise<IReading[]> => {
        const useCase: CreateDataPointsFromSensorReading = new CreateDataPointsFromSensorReading(readingRepository, sensorRepository);

        return useCase
            .use(input)
            .then((result: ICreateDataPointsFromSensorReadingResult): IReading[] => {
                return result.dataPoints;
            });
    });

    const allDataPoints: IReading[][] = await Promise.all(jobs);

    return {
        success: true,
        data: {
            dataPoints: flattenArray(allDataPoints),
        },
        error: null,
    };
}

function flattenArray<TType> (arr: TType[][]): TType[] {
    return arr.reduce((acc: TType[], values: TType[]): TType[] => {
        return [
            ...acc,
            ...values,
        ];
    }, []);
}
