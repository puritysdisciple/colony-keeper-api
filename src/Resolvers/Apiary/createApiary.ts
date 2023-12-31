import { IApiary } from 'colony-keeper-core';
import { CreateApiary, ICreateApiaryInput, IValidationError } from 'colony-keeper-use-cases';

import { isUserAuthenticated } from '../../Authentication/isUserAuthenticated';
import { NotAuthorizedError } from '../../Authentication/NotAuthorizedError';
import { IContext } from '../IContext';

export const createApiarySchema: string = `
    enum CreateApiaryResult {
        UNKNOWN
        SUCCESS
        USER_NOT_FOUND
        INVALID_INPUT
    }

    type Location {
        latitude: Float!
        longitude: Float!
    }

    type Apiary {
        id: String!
        name: String!
        location: Location
        userId: String!
    }
    
    input LocationInput {
        latitude: Float!
        longitude: Float!
    }
    
    input CreateApiaryInput {
        name: String!
        location: LocationInput
    }
    
    type CreateApiarySuccess {
        apiary: Apiary!
    }
    
    type CreateApiaryUserNotFound {
        userId: String
    }
    
    type CreateApiaryInvalidInput {
        errors: [ValidationError]!
    }
    
    type CreateApiary {
        result: CreateApiaryResult!
        success: CreateApiarySuccess
        userNotFound: CreateApiaryUserNotFound
        invalidInput: CreateApiaryInvalidInput
    }

    extend type Mutation {
        createApiary (input: CreateApiaryInput!): CreateApiary!
    }
`;

export type ICreateApiaryResponse = {
    result: 'UNKNOWN';
    success: null;
    userNotFound: null;
    invalidInput: null;
} | {
    result: 'SUCCESS';
    success: {
        apiary: IApiary;
    };
    userNotFound: null;
    invalidInput: null;
} | {
    result: 'USER_NOT_FOUND';
    success: null;
    userNotFound: {
        userId: string;
    };
    invalidInput: null;
} | {
    result: 'INVALID_INPUT';
    success: null;
    userNotFound: null;
    invalidInput: {
        errors: IValidationError[];
    };
};

export async function createApiaryResolver (_: any, params: any, context: IContext): Promise<ICreateApiaryResponse> {
    const {
        dataSources: {
            user: userRepository,
            apiary: apiaryRepository,
        },
        currentUser,
    }: IContext = context;

    const { name, location }: ICreateApiaryInput = params.input;

    if (!isUserAuthenticated(currentUser)) {
        throw new NotAuthorizedError();
    }

    const useCase: CreateApiary = new CreateApiary({
        user: userRepository,
        apiary: apiaryRepository,
    });

    let response: ICreateApiaryResponse = {
        result: 'UNKNOWN',
        success: null,
        userNotFound: null,
        invalidInput: null,
    };

    await useCase.execute({
        name: name,
        location: location,
        userId: currentUser.id,
    }, {
        success: (apiary: IApiary): void =>  {
            response = {
                result: 'SUCCESS',
                success: {
                    apiary: apiary,
                },
                userNotFound: null,
                invalidInput: null,
            };
        },
        userNotFound: (userId: string): void => {
            response = {
                result: 'USER_NOT_FOUND',
                success: null,
                userNotFound: {
                    userId: userId,
                },
                invalidInput: null,
            };
        },
        invalidInput: (errors: IValidationError[]): void => {
            response = {
                result: 'INVALID_INPUT',
                success: null,
                userNotFound: null,
                invalidInput: {
                    errors: errors,
                },
            };
        },
    });

    return response;
}
