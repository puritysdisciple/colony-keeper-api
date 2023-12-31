import { authenticateUserResolver, authenticateUserSchema } from './authenticateUser';
import { registerUserResolver, registerUserSchema } from './registerUser';

export const schema: string[] = [authenticateUserSchema, registerUserSchema];

export const resolvers: Record<string, any> = {
    Query: {},
    Mutation: {
        authenticateUser: authenticateUserResolver,
        registerUser: registerUserResolver,
    },
};
