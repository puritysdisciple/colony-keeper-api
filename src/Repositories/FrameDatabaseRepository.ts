import { Frame } from 'colony-keeper-core';
import { IFrameRepository } from 'colony-keeper-use-cases';

import { DatabaseContext } from '../DataSources/DatabaseContext';

import { FrameModel } from './Models/FrameModel';

export class FrameDatabaseRepository implements IFrameRepository {
    private _context: DatabaseContext;

    public constructor (databaseContext: DatabaseContext) {
        this._context = databaseContext;
    }

    public async save (frame: Frame): Promise<Frame> {
        const newFrame: FrameModel = this._context.models.frame.buildFromFrame(frame);

        await newFrame.save();

        return frame;
    }
}
