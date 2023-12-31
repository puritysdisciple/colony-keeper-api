import { GraphQLResponse } from '@apollo/server';
import { Alert, ALERT_TYPE, Apiary, Hive, IAlert, IApiary, IHive, IUser, User } from 'colony-keeper-core';
import { FormattedExecutionResult } from 'graphql/index';

import { IViewApiaryDetailsResponse } from '../src/Resolvers/Apiary/viewApiaryDetails';
import { server } from '../src/server';

import { getResponseBody } from './getResponseBody';
import { TestFixture } from './TestFixture';

const APIARY_DETAILS_QUERY: string = `
    query viewApiaryDetails ($apiaryId: Int!) {
        apiaryDetails (apiaryId: $apiaryId) {
            apiary {
                id
                name
            }
            hives {
                id
                name
                alerts {
                    id
                    type
                }
            }
        }
    }
`;

describe('apiaryDetails', (): void => {
    let fixture: TestFixture;

    beforeEach(async (): Promise<void> => {
        fixture = new TestFixture();

        await fixture.setup();
    });

    afterEach(async (): Promise<void> => {
        await fixture.teardown();
    });

    it('should give an error if the apiary cannot be found', async (): Promise<void> => {
        const response: GraphQLResponse<IViewApiaryDetailsResponse> = await server.executeOperation<IViewApiaryDetailsResponse>({
            query: APIARY_DETAILS_QUERY,
            variables: {
                apiaryId: -1,
            },
        }, {
            contextValue: fixture.context,
        });

        const result: FormattedExecutionResult<IViewApiaryDetailsResponse> = getResponseBody(response);

        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe('Apiary with id "-1" was not found.');
    });

    it('should give the details of the apiary', async (): Promise<void> => {
        const user: IUser = await fixture.createUser(User.create({
            email: 'apiary-details-test@test.com',
        }));

        const apiary: IApiary = await fixture.createApiary(Apiary.create({
            name: 'Test Apiary',
            location: {
                latitude: 10,
                longitude: 10,
            },
            user: user,
        }));

        const hive1: IHive = await fixture.createHive(Hive.create({
            name: 'Test Hive 1',
            apiary: apiary,
        }));

        const hive2: IHive = await fixture.createHive(Hive.create({
            name: 'Test Hive 1',
            apiary: apiary,
        }));

        const alert: IAlert = await fixture.createAlert(Alert.create({
            type: ALERT_TYPE.LOW_BATTERY,
            hive: hive1,
        }));

        const response: GraphQLResponse<IViewApiaryDetailsResponse> = await server.executeOperation<IViewApiaryDetailsResponse>({
            query: APIARY_DETAILS_QUERY,
            variables: {
                apiaryId: apiary.id,
            },
        }, {
            contextValue: fixture.context,
        });

        const result: FormattedExecutionResult<IViewApiaryDetailsResponse> = getResponseBody(response);

        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            apiaryDetails: {
                apiary: {
                    id: apiary.id,
                    name: apiary.name,
                },
                hives: [{
                    id: hive1.id,
                    name: hive1.name,
                    alerts: [{
                        id: alert.id,
                        type: alert.type,
                    }],
                }, {
                    id: hive2.id,
                    name: hive2.name,
                    alerts: [],
                }],
            },
        });
    });
});
