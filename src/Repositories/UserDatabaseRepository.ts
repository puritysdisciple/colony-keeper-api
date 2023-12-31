import { INullable, User } from 'colony-keeper-core';
import { IUserRepository } from 'colony-keeper-use-cases';
import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';

import { DatabaseContext } from '../DataSources/DatabaseContext';

import { SessionModel } from './Models/SessionModel';
import { UserModel } from './Models/UserModel';

export class UserDatabaseRepository implements IUserRepository {
    private _context: DatabaseContext;

    public constructor (databaseContext: DatabaseContext) {
        this._context = databaseContext;
    }

    public async findById (userId: string): Promise<INullable<User>> {
        const model: UserModel = await this._context.models.user.findByPk(userId);

        if (!model) {
            return null;
        }

        return model.toUser();
    }

    // Not needed anymore?
    public async save (user: User): Promise<User> {
        const newUser: any = this._context.models.user.buildFromUser(user);

        await newUser.save();

        return user;
    }

    public async destroy (user: User): Promise<void> {
        await this._context.models.user.destroy({
            where: {
                id: user.id,
            },
        });
    }

    public async authenticate (email: string, password: string): Promise<INullable<string>> {
        const user: INullable<UserModel> = await this._context.models.user.findOne({
            where: {
                email: email,
            },
        });

        if (user === null) {
            return null;
        }

        if (md5(password) !== user.password) {
            return null;
        }

        const sessionId: string = uuidv4();

        await this._context.models.session.destroy({
            where: {
                email: email,
            },
        });

        const newSession: SessionModel = SessionModel.build({
            id: sessionId,
            email: email,
        });

        await newSession.save();

        return sessionId;
    }

    public async findByEmail (email: string): Promise<INullable<User>> {
        const user: INullable<UserModel> = await this._context.models.user.findOne({
            where: {
                email: email,
            },
        });

        if (user === null) {
            return null;
        }

        return user.toUser();
    }

    public async findByToken (token: string): Promise<INullable<User>> {
        const session: INullable<SessionModel> = await this._context.models.session.findByPk(token);

        if (session === null) {
            return null;
        }

        return this.findByEmail(session.email);
    }

    public async register (user: User, password: string): Promise<INullable<User>> {
        const newUser: UserModel = this._context.models.user.buildFromUser(user);

        newUser.password = md5(password);

        await newUser.save();

        return user;
    }
}
