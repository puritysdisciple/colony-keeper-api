import { GraphQLError } from 'graphql/error';

export class NotAuthorizedError extends GraphQLError {
    public constructor () {
        super('Not authorized', {
            extensions: {
                code: 'UNAUTHENTICATED',
                http: {
                    status: 401,
                },
            },
        });
    }
}
