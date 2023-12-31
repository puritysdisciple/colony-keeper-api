import { INullable } from 'colony-keeper-core';
import { IApiaryDetails, ViewApiaryDetails } from 'colony-keeper-use-cases';

import { isUserAuthenticated } from '../../Authentication/isUserAuthenticated';
import { IContext } from '../IContext';

export const viewApiaryDetailsSchema: string = `
    enum ViewApiaryDetailsResult {
        UNKNOWN
        SUCCESS
        APIARY_NOT_FOUND
        NOT_AUTHORIZED
    }

    type Alert {
        id: String!
        type: String!
    }

    type HiveStub {
        id: String!
        name: String!
        alerts: [Alert]!
    }

    type ViewApiaryDetailsSuccess {
        apiary: ApiaryStub!
        hives: [HiveStub]!
    }
    
    type ViewApiaryDetailsApiaryNotFound {
        apiaryId: String!
    }
    
    type ViewApiaryDetailsNotAuthorized {
        userId: String
        apiaryId: String!
    }
    
    type ViewApiaryDetails {
        result: ViewApiaryDetailsResult!
        success: ViewApiaryDetailsSuccess
        apiaryNotFound: ViewApiaryDetailsApiaryNotFound
        notAuthorized: ViewApiaryDetailsNotAuthorized
    }

    extend type Query {
        viewApiaryDetails (apiaryId: String!): ViewApiaryDetails!
    }
`;

export type IViewApiaryDetailsResponse = {
    result: 'UNKNOWN';
    success: null;
    apiaryNotFound: null;
    notAuthorized: null;
} | {
    result: 'SUCCESS';
    success: IApiaryDetails;
    apiaryNotFound: null;
    notAuthorized: null;
} | {
    result: 'APIARY_NOT_FOUND';
    success: null;
    apiaryNotFound: {
        apiaryId: string;
    };
    notAuthorized: null;
} | {
    result: 'NOT_AUTHORIZED';
    success: null;
    apiaryNotFound: null;
    notAuthorized: {
        userId: INullable<string>;
        apiaryId: string;
    };
};

export async function viewApiaryDetailsResolver (_: any, params: any, context: IContext): Promise<IViewApiaryDetailsResponse> {
    const {
        dataSources: {
            alert: alertRepository,
            apiary: apiaryRepository,
            hive: hiveRepository,
        },
        currentUser,
    }: IContext = context;

    const { apiaryId }: { apiaryId: string } = params;

    if (!isUserAuthenticated(currentUser)) {
        return {
            result: 'NOT_AUTHORIZED',
            success: null,
            apiaryNotFound: null,
            notAuthorized: {
                userId: null,
                apiaryId: apiaryId,
            },
        };
    }

    let response: IViewApiaryDetailsResponse = {
        result: 'UNKNOWN',
        success: null,
        apiaryNotFound: null,
        notAuthorized: null,
    };

    const useCase: ViewApiaryDetails = new ViewApiaryDetails({
        apiary: apiaryRepository,
        hive: hiveRepository,
        alert: alertRepository,
    });

    await useCase.execute({
        apiaryId: apiaryId,
        currentUserId: currentUser.id,
    }, {
        success: (details: IApiaryDetails): void =>  {
            response = {
                result: 'SUCCESS',
                success: details,
                apiaryNotFound: null,
                notAuthorized: null,
            };
        },
        apiaryNotFound: (apiaryId: string): void => {
            response = {
                result: 'APIARY_NOT_FOUND',
                success: null,
                apiaryNotFound: {
                    apiaryId: apiaryId,
                },
                notAuthorized: null,
            };
        },
        notAuthorized: (userId: string, apiaryId: string): void => {
            response = {
                result: 'NOT_AUTHORIZED',
                success: null,
                apiaryNotFound: null,
                notAuthorized: {
                    userId: userId,
                    apiaryId: apiaryId,
                },
            };
        },
    });

    return response;
}
