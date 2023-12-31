import type { INullable, IUser } from 'colony-keeper-core';
import {
    typeSafeNull,
    RegisterUser,
    IValidationError,
    IRegisterUserInput,
} from 'colony-keeper-use-cases';

import { IContext } from '../IContext';

export const registerUserSchema: string = `
    enum RegisterUserResult {
        UNKNOWN
        SUCCESS
        EMAIL_IN_USE
        INVALID_INPUT
    }

    type User {
        id: String!
        email: String!
        phone: String
    }
    
    type RegisterUserSuccess {
        user: User!
    }
    
    type RegisterUserEmailInUse {
        email: String!
    }
    
    type RegisterUserInvalidInput {
        errors: [ValidationError]!
    }
    
    type RegisterUserResponse {
        result: RegisterUserResult!
        success: RegisterUserSuccess
        emailInUse: RegisterUserEmailInUse
        invalidInput: RegisterUserInvalidInput
    }
    
    input RegisterUserInput {
        email: String!
        password: String!
    }

    extend type Mutation {
        registerUser (input: RegisterUserInput!): RegisterUserResponse
    }
`;

export type IRegisterUserResponse = {
    result: 'UNKNOWN';
    success: null;
    emailInUse: null;
    invalidInput: null;
} | {
    result: 'SUCCESS';
    success: {
        user: IUser;
    };
    emailInUse: null;
    invalidInput: null;
} | {
    result: 'EMAIL_IN_USE';
    success: null;
    emailInUse: {
        email: string;
    };
    invalidInput: null;
} | {
    result: 'INVALID_INPUT';
    success: null;
    emailInUse: null;
    invalidInput: {
        errors: IValidationError[];
    };
};

export async function registerUserResolver (_: any, params: any, context: IContext): Promise<IRegisterUserResponse> {
    const {
        dataSources: {
            user: userRepository,
        },
    }: IContext = context;

    const { email, password }: IRegisterUserInput = params.input;

    let response: IRegisterUserResponse = {
        result: 'UNKNOWN',
        success: null,
        emailInUse: null,
        invalidInput: null,
    };

    const useCase: RegisterUser = new RegisterUser({
        user: userRepository,
    });

    await useCase.execute({
        email: email,
        password: password,
    }, {
        emailInUse: (email: string): void => {
            response = {
                result: 'EMAIL_IN_USE',
                success: null,
                emailInUse: {
                    email: email,
                },
                invalidInput: null,
            };
        },

        invalidInput: (errors: IValidationError[]): void => {
            response = {
                result: 'INVALID_INPUT',
                success: null,
                emailInUse: null,
                invalidInput: {
                    errors: errors,
                },
            };
        },

        success: (user: IUser): void => {
            response = {
                result: 'SUCCESS',
                success: {
                    user: user,
                },
                emailInUse: null,
                invalidInput: null,
            };
        },
    });

    return response;
}
