import { SQSRecord } from 'aws-lambda';

export const parseRecords = (records: SQSRecord[]) => {
    return records.map((record) => {
        const { body } = record;
        return JSON.parse(body);
    });
};
