import { IAuthenticateUserInput, AuthenticateUser } from 'colony-keeper-use-cases';

import { IContext } from '../IContext';

export const authenticateUserSchema: string = `
    enum AuthenticateUserResult {
        UNKNOWN
        SUCCESS
        INVALID_CREDENTIALS
    }

    type AuthenticateUserSuccess {
        token: String!
    }
    
    input AuthenticateUserInput {
        email: String!
        password: String!
    }
    
    type AuthenticateUser {
        result: AuthenticateUserResult!
        success: AuthenticateUserSuccess
    }

    extend type Mutation {
        authenticateUser (input: AuthenticateUserInput!): AuthenticateUser
    }
`;

export type IAuthenticateUserResponse = {
    result: 'UNKNOWN';
    success: null;
} | {
    result: 'SUCCESS';
    success: {
        token: string;
    };
} | {
    result: 'INVALID_CREDENTIALS';
    success: null;
};

export async function authenticateUserResolver (_: any, params: any, context: IContext): Promise<IAuthenticateUserResponse> {
    const {
        dataSources: {
            user: userRepository,
        },
    }: IContext = context;

    const { email, password }: IAuthenticateUserInput = params.input;

    let response: IAuthenticateUserResponse = {
        result: 'UNKNOWN',
        success: null,
    };

    const useCase: AuthenticateUser = new AuthenticateUser({
        user: userRepository,
    });

    await useCase.execute({
        email: email,
        password: password,
    }, {
        invalidCredentials: (): void => {
            response = {
                result: 'INVALID_CREDENTIALS',
                success: null,
            };
        },

        success: (token: string): void => {
            response = {
                result: 'SUCCESS',
                success: {
                    token: token,
                },
            };
        },
    });

    return response;
}
