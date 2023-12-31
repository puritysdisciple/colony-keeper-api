import { GraphQLResponse } from '@apollo/server';
import { FormattedExecutionResult } from 'graphql/index';

export function getResponseBody<TType> (response: GraphQLResponse<TType>): FormattedExecutionResult<TType> {
    if (response.body.kind !== 'single') {
        throw new Error('unknown body');
    }

    return response.body.singleResult;
}
