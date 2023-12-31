import { GraphQLResponse } from '@apollo/server';
import { Apiary, IApiary, IUser, User } from 'colony-keeper-core';
import { FormattedExecutionResult } from 'graphql/index';

import { IViewApiaryListResponse } from '../src/Resolvers/Apiary/viewApiaryList';
import { server } from '../src/server';

import { getResponseBody } from './getResponseBody';
import { TestFixture } from './TestFixture';

const APIARIES_LIST_QUERY: string = `
    query listApiaries ($userId: Int!) {
        apiaryList (userId: $userId) {
            id
            name
        }
    }
`;

describe('apiaryList', (): void => {
    let fixture: TestFixture;

    beforeEach(async (): Promise<void> => {
        fixture = new TestFixture();

        await fixture.setup();
    });

    afterEach(async (): Promise<void> => {
        await fixture.teardown();
    });

    it('should give an error if the user cannot be found', async (): Promise<void> => {
        const response: GraphQLResponse<IViewApiaryListResponse> = await server.executeOperation<IViewApiaryListResponse>({
            query: APIARIES_LIST_QUERY,
            variables: {
                userId: -1,
            },
        }, {
            contextValue: fixture.context,
        });

        const result: FormattedExecutionResult<IViewApiaryListResponse> = getResponseBody(response);

        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe('User with id "-1" was not found.');
    });

    it('should give an empty list if no apiaries exist for a user', async (): Promise<void> => {
        const user: IUser = await fixture.createUser(User.create({
            email: 'apiary-list-test@test.com',
        }));

        const response: GraphQLResponse<IViewApiaryListResponse> = await server.executeOperation<IViewApiaryListResponse>({
            query: APIARIES_LIST_QUERY,
            variables: {
                userId: user.id,
            },
        }, {
            contextValue: fixture.context,
        });

        const result: FormattedExecutionResult<IViewApiaryListResponse> = getResponseBody(response);

        expect(result.data).toEqual({
            apiaryList: [],
        });
    });

    it('should give a list of apiaries for the user', async (): Promise<void> => {
        const user: IUser = await fixture.createUser(User.create({
            email: 'apiary-list-test@test.com',
        }));

        const apiary1: IApiary = await fixture.createApiary(Apiary.create({
            name: 'Test Apiary 1',
            location: {
                longitude: 1,
                latitude: 1,
            },
            user: user,
        }));

        const apiary2: IApiary = await fixture.createApiary(Apiary.create({
            name: 'Test Apiary 2',
            location: {
                longitude: 1,
                latitude: 1,
            },
            user: user,
        }));

        const response: GraphQLResponse<IViewApiaryListResponse> = await server.executeOperation<IViewApiaryListResponse>({
            query: APIARIES_LIST_QUERY,
            variables: {
                userId: user.id,
            },
        }, {
            contextValue: fixture.context,
        });

        const result: FormattedExecutionResult<IViewApiaryListResponse> = getResponseBody(response);

        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            apiaryList: [{
                id: apiary1.id,
                name: apiary1.name,
            }, {
                id: apiary2.id,
                name: apiary2.name,
            }],
        });
    });
});
