export const dataPointSchema: string = `
    enum DataType {
        TEMPERATURE,
        HUMIDITY
        AMBIENT_TEMPERATURE
        AMBIENT_HUMIDITY
        BATTERY_VOLTAGE
        WEIGHT
    }

    type DataPoint {
        id: Int
        sensorId: String!
        type: DataType!
        timestamp: Int!
        value: Float!
    }
`;
