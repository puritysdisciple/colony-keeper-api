export type IQueryResult<TType> = {
    success: true;
    data: TType;
    error: null;
} | {
    success: false;
    data: null;
    error: {
        message: string;
    };
};
