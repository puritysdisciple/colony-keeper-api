import { IApiary, INullable } from 'colony-keeper-core';
import { ListApiaries } from 'colony-keeper-use-cases';

import { isUserAuthenticated } from '../../Authentication/isUserAuthenticated';
import { IContext } from '../IContext';

export const viewApiaryListSchema: string = `
    enum ViewApiaryListResult {
        UNKNOWN
        SUCCESS
        USER_NOT_FOUND
    }

    type ApiaryStub {
        id: String!
        name: String!
        location: Location
        userId: String!
        hiveCount: Int!
        hiveWithAlertsCount: Int!
    }
    
    type ViewApiaryListSuccess {
        apiaries: [ApiaryStub]!
    }
    
    type ViewApiaryListUserNotFound {
        userId: String
    }
    
    type ViewApiaryList {
        result: ViewApiaryListResult!
        success: ViewApiaryListSuccess
        userNotFound: ViewApiaryListUserNotFound
    }

    extend type Query {
        viewApiaryList: ViewApiaryList!
    }
`;

export type IViewApiaryListResponse = {
    result: 'UNKNOWN';
    success: null;
    userNotFound: null;
} | {
    result: 'SUCCESS';
    success: {
        apiaries: IApiary[];
    };
    userNotFound: null;
} | {
    result: 'USER_NOT_FOUND';
    success: null;
    userNotFound: {
        userId: INullable<string>;
    };
};

export async function viewApiaryListResolver (_: any, params: any, context: IContext): Promise<IViewApiaryListResponse> {
    const {
        dataSources: {
            user: userRepository,
            apiary: apiaryRepository,
        },
        currentUser,
    }: IContext = context;

    if (!isUserAuthenticated(currentUser)) {
        return {
            result: 'USER_NOT_FOUND',
            success: null,
            userNotFound: {
                userId: null,
            },
        };
    }

    let response: IViewApiaryListResponse = {
        result: 'UNKNOWN',
        success: null,
        userNotFound: null,
    };

    const useCase: ListApiaries = new ListApiaries({
        user: userRepository,
        apiary: apiaryRepository,
    });

    await useCase.execute(currentUser.id, {
        success: (apiaries: IApiary[]): void =>  {
            response = {
                result: 'SUCCESS',
                success: {
                    apiaries: apiaries.map((apiary: IApiary): IApiary & { hiveCount: number; hiveWithAlertsCount: number } => {
                        return {
                            ...apiary,
                            hiveCount: 0,
                            hiveWithAlertsCount: 0,
                        };
                    }),
                },
                userNotFound: null,
            };
        },
        userNotFound: (userId: string): void => {
            response = {
                result: 'USER_NOT_FOUND',
                userNotFound: {
                    userId: userId,
                },
                success: null,
            };
        },
    });

    return response;
}
