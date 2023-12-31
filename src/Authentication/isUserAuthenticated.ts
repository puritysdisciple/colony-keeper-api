import { INullable, IUser } from 'colony-keeper-core';

export function isUserAuthenticated (currentUser: INullable<IUser>): currentUser is IUser {
    if (!currentUser) {
        return false;
    }

    return true;
}
