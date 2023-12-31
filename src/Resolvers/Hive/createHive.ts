import { IHive, INullable } from 'colony-keeper-core';
import { typeSafeNull, CreateHive, ICreateHiveInput, IValidationError } from 'colony-keeper-use-cases';

import { IContext } from '../IContext';

export const createHiveSchema: string = `
    enum CreateHiveResult {
        UNKNOWN
        SUCCESS
        NOT_AUTHORIZED
        INVALID_INPUT
        APIARY_NOT_FOUND
    }
    
    input CreateHiveInput {
        name: String!
        apiaryId: String!
    }
    
    type Hive {
        id: String!
        name: String!
        apiaryId: String!
    }
    
    type CreateHiveSuccess {
        hive: Hive!
    }
    
    type CreateHiveInvalidInput {
        errors: [ValidationError]
    }
    
    type CreateHiveApiaryNotFound {
        apiaryId: String!
    }
    
    type CreateHive {
        result: CreateHiveResult!
        success: CreateHiveSuccess
        apiaryNotFound: CreateHiveApiaryNotFound
        invalidInput: CreateHiveInvalidInput
    }

    extend type Mutation {
        createHive (input: CreateHiveInput!): CreateHive!
    }
`;

export type ICreateHiveResponse = {
    result: 'UNKNOWN';
    success: null;
    apiaryNotFound: null;
    invalidInput: null;
} | {
    result: 'SUCCESS';
    success: {
        hive: IHive;
    };
    apiaryNotFound: null;
    invalidInput: null;
} | {
    result: 'APIARY_NOT_FOUND';
    success: null;
    apiaryNotFound: {
        apiaryId: string;
    };
    invalidInput: null;
} | {
    result: 'INVALID_INPUT';
    success: null;
    apiaryNotFound: null;
    invalidInput: {
        errors: IValidationError[];
    };
};

export async function createHiveResolver (_: any, params: any, context: IContext): Promise<ICreateHiveResponse> {
    const {
        dataSources: {
            apiary: apiaryRepository,
            hive: hiveRepository,
        },
    }: IContext = context;

    const { name, apiaryId }: ICreateHiveInput = params.input;

    let response: ICreateHiveResponse = {
        result: 'UNKNOWN',
        success: null,
        apiaryNotFound: null,
        invalidInput: null,
    };

    const useCase: CreateHive = new CreateHive({
        apiary: apiaryRepository,
        hive: hiveRepository,
    });

    await useCase.execute({
        name: name,
        apiaryId: apiaryId,
    }, {
        apiaryNotFound: (apiaryId: string): void => {
            response = {
                result: 'APIARY_NOT_FOUND',
                apiaryNotFound: {
                    apiaryId: apiaryId,
                },
                invalidInput: null,
                success: null,
            };
        },

        invalidInput: (errors: IValidationError[]): void => {
            response = {
                result: 'INVALID_INPUT',
                success: null,
                invalidInput: {
                    errors: errors,
                },
                apiaryNotFound: null,
            };
        },

        success: (hive: IHive): void => {
            response = {
                result: 'SUCCESS',
                success: {
                    hive: hive,
                },
                apiaryNotFound: null,
                invalidInput: null,
            };
        },
    });

    return response;
}
