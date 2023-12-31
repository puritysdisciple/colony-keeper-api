import { INullable } from 'colony-keeper-core';
import { IHiveDetails, ViewHiveDetails } from 'colony-keeper-use-cases';

import { IContext } from '../IContext';

export const viewHiveDetailsSchema: string = `
    enum ViewHiveDetailsResult {
        UNKNOWN
        SUCCESS
        NOT_AUTHORIZED
        APIARY_NOT_FOUND
        HIVE_NOT_FOUND
    }

    type ReadingStub {
        value: Float!
        timestamp: Float!
    }
    
    enum HiveComponentType {
        DEEP
        STANDARD
        SHALLOW
        QUEEN_EXCLUDER
        TOP
    }
    
    type FrameGapStats {
        broodRange: Float!
        stability: Float!
        usage: Float!
        averageTemperature: Float
    }
    
    type FrameGap {
        brood: Boolean!
        bees: Boolean!
        stats: FrameGapStats!
        sensorId: String
    }
    
    type HiveComponent {
        type: HiveComponentType!
        frameCount: Int
        gaps: [FrameGap]
    }

    type SensorStub {
        id: String!
        serial: String!
        type: String!
        latestReading: ReadingStub
        readings: [ReadingStub]!
    }
    
    type HiveDetails {
        id: String!
        name: String!
        components: [HiveComponent]!
    }

    type ViewHiveDetailsSuccess {
        alerts: [Alert]!
        apiary: ApiaryStub!
        hive: HiveDetails!
        sensors: [SensorStub]!
    }
    
    type ViewHiveDetailsApiaryNotFound {
        apiaryId: String!
    }
    
    type ViewHiveDetailsHiveNotFound {
        hiveId: String!
    }
    
    type ViewHiveDetailsNotAuthorized {
        hiveId: String!
        userId: String
    }
    
    type ViewHiveDetails {
        result: ViewHiveDetailsResult!
        success: ViewHiveDetailsSuccess
        apiaryNotFound: ViewHiveDetailsApiaryNotFound
        hiveNotFound: ViewHiveDetailsHiveNotFound
        notAuthorized: ViewHiveDetailsNotAuthorized
    }

    extend type Query {
        viewHiveDetails (hiveId: String!): ViewHiveDetails
    }
`;

export type IViewHiveDetailsResponse = {
    result: 'UNKNOWN';
    success: null;
    apiaryNotFound: null;
    hiveNotFound: null;
    notAuthorized: null;
} | {
    result: 'SUCCESS';
    success: IHiveDetails;
    apiaryNotFound: null;
    hiveNotFound: null;
    notAuthorized: null;
} | {
    result: 'APIARY_NOT_FOUND';
    success: null;
    apiaryNotFound: {
        apiaryId: string;
    };
    hiveNotFound: null;
    notAuthorized: null;
} | {
    result: 'HIVE_NOT_FOUND';
    success: null;
    apiaryNotFound: null;
    hiveNotFound: {
        hiveId: string;
    };
    notAuthorized: null;
} | {
    result: 'NOT_AUTHORIZED';
    success: null;
    apiaryNotFound: null;
    hiveNotFound: null;
    notAuthorized: {
        userId: INullable<string>;
        hiveId: string;
    };
};

export async function viewHiveDetailsResolver (_: any, params: any, context: IContext): Promise<IViewHiveDetailsResponse> {
    const {
        dataSources: {
            alert: alertRepository,
            box: boxRepository,
            apiary: apiaryRepository,
            hive: hiveRepository,
            reading: readingRepository,
            sensor: sensorRepository,
        },
    }: IContext = context;

    const { hiveId }: { hiveId: string } = params;

    let response: IViewHiveDetailsResponse = {
        result: 'UNKNOWN',
        success: null,
        apiaryNotFound: null,
        hiveNotFound: null,
        notAuthorized: null,
    };

    const useCase: ViewHiveDetails = new ViewHiveDetails({
        alert: alertRepository,
        box: boxRepository,
        apiary: apiaryRepository,
        hive: hiveRepository,
        reading: readingRepository,
        sensor: sensorRepository,
    });

    await useCase.execute(hiveId, {
        hiveNotFound: (hiveId: string): void => {
            response = {
                result: 'HIVE_NOT_FOUND',
                success: null,
                apiaryNotFound: null,
                hiveNotFound: {
                    hiveId: hiveId,
                },
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
                hiveNotFound: null,
                notAuthorized: null,
            };
        },

        notAuthorized: (hiveId: string, userId: string): void => {
            response = {
                result: 'NOT_AUTHORIZED',
                success: null,
                apiaryNotFound: null,
                hiveNotFound: null,
                notAuthorized: {
                    hiveId: hiveId,
                    userId: userId,
                },
            };
        },

        success: (details: IHiveDetails): void => {
            response = {
                result: 'SUCCESS',
                success: details,
                apiaryNotFound: null,
                hiveNotFound: null,
                notAuthorized: null,
            };
        },
    });

    return response;
}
