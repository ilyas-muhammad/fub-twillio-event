import { formatDate } from '../../../src/helpers/dates';
import { utcToZonedTime } from 'date-fns-tz';

describe('Dates helper', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const tz = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ?? 'UTC';
    const date = utcToZonedTime(new Date(Date.UTC(2022, 0, 1)), tz);
    jest.useFakeTimers().setSystemTime(date);
    it('formatDate should return ISO string', () => {
        const result = formatDate(new Date());
        const ISOString = '2022-01-01T00:00:00.000Z';

        expect(result).toMatch(ISOString);
    });

    // it('translateInstructionIntoUTCDate should return a date', () => {
    //     const result = translateInstructionIntoUTCDate('now');
    //     const date = new Date('2022-01-01T00:00:00.000Z');

    //     expect(result).toStrictEqual(date);
    // });

    // it('translateInstructionIntoUTCDate should return a date 1 year from now', () => {
    //     const result = translateInstructionIntoUTCDate('1y');
    //     const date = new Date('2023-01-01T00:00:00.000Z');

    //     expect(result).toStrictEqual(date);
    // });

    // it('translateInstructionIntoUTCDate should return a date 1 month from now', () => {
    //     const result = translateInstructionIntoUTCDate('1M');
    //     const date = new Date('2022-02-01T00:00:00.000Z');

    //     expect(result).toStrictEqual(date);
    // });

    // it('translateInstructionIntoUTCDate should return a date 1 week from now', () => {
    //     const result = translateInstructionIntoUTCDate('1w');
    //     const date = new Date('2022-01-08T00:00:00.000Z');

    //     expect(result).toStrictEqual(date);
    // });

    // it('translateInstructionIntoUTCDate should return a date 1 day from now', () => {
    //     const result = translateInstructionIntoUTCDate('1d');
    //     const date = new Date('2022-01-02T00:00:00.000Z');

    //     expect(result).toStrictEqual(date);
    // });

    // it('translateInstructionIntoUTCDate should return a date 1 hour from now', () => {
    //     const result = translateInstructionIntoUTCDate('1h');
    //     const date = new Date('2022-01-01T01:00:00.000Z');

    //     expect(result).toStrictEqual(date);
    // });

    // it('translateInstructionIntoUTCDate should return a date 1 minute from now', () => {
    //     const result = translateInstructionIntoUTCDate('1m');
    //     const date = new Date('2022-01-01T00:01:00.000Z');

    //     expect(result).toStrictEqual(date);
    // });

    // it('translateInstructionIntoUTCDate should return a date 1 second from now', () => {
    //     const result = translateInstructionIntoUTCDate('1s');
    //     const date = new Date('2022-01-01T00:00:01.000Z');

    //     expect(result).toStrictEqual(date);
    // });

    // it('translateInstructionIntoUTCDate should return a date at 9am', () => {
    //     const result = translateInstructionIntoUTCDate('9am');
    //     const date = new Date('2022-01-01T09:00:00.000Z');

    //     expect(result).toStrictEqual(date);
    // });

    // it('translateInstructionIntoUTCDate should return a date at 9:30am', () => {
    //     const result = translateInstructionIntoUTCDate('9:30am');
    //     const date = new Date('2022-01-01T09:30:00.000Z');

    //     expect(result).toStrictEqual(date);
    // });
});
