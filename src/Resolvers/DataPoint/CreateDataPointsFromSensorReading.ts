import { INullable, IReading, Reading, Sensor } from 'colony-keeper-core';
import { IReadingRepository, ISensorRepository } from 'colony-keeper-use-cases';

export interface ICreateDataPointsFromSensorReadingParams {
    sensorId: string;
    timestamp: number;
    value1: INullable<number>;
    value2: INullable<number>;
}

export interface ICreateDataPointsFromSensorReadingResult {
    dataPoints: IReading[];
}

const UNKNOWN_HIVE_ID: string = 'c5774021-83f8-452f-b398-13c78a5a3b29';

export class CreateDataPointsFromSensorReading {
    private readonly _readingRepository: IReadingRepository;
    private readonly _sensorRepository: ISensorRepository;

    public constructor (readingRepository: IReadingRepository, sensorRepository: ISensorRepository) {
        this._readingRepository = readingRepository;
        this._sensorRepository = sensorRepository;
    }

    public async use (params: ICreateDataPointsFromSensorReadingParams): Promise<ICreateDataPointsFromSensorReadingResult> {
        const { sensorId, value1 }: ICreateDataPointsFromSensorReadingParams = params;
        let sensor: INullable<Sensor> = await this._sensorRepository.findBySsid(sensorId);

        if (sensor === null) {
            sensor = Sensor.create({
                id: sensorId,
                ssid: sensorId,
                hiveId: UNKNOWN_HIVE_ID,
                deviceId: null,
                boxId: null,
                type1: 'UNKNOWN_1',
                type2: 'UNKNOWN_2',
                frameGapIndex: 0,
                calibration: 0,
            });
        }

        const dataPoints: IReading[] = [];
        const value: number = Math.round(value1 * 1000) / 1000;

        if (sensor.type1 === 'NONE') {
            return;
        }

        const reading: Reading = await this._readingRepository.createReading(Reading.create({
            hiveId: sensor.hiveId,
            boxId: sensor.boxId,
            sensorId: sensor.id,
            type: sensor.type1,
            value: value + (sensor.calibration ?? 0),
            timestamp: new Date(),
        }));

        dataPoints.push(reading.toObject());

        return {
            dataPoints: dataPoints,
        };
    }
}
