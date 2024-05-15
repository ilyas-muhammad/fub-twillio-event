import { addYears, addMonths, addWeeks, addDays, addHours, addMinutes, addSeconds, addMilliseconds } from 'date-fns';

const formatDate = (date: Date): string => {
    return date.toISOString();
};

const formatDateNow = (): string => {
    return new Date().toISOString();
};

/**
 * Translate an instruction such as "now" or "1h" or "10am" or "9:30pm" or "1m" or "1y" into a date
 * @param instruction - string to translate
 */
export const translateInstructionIntoUTCDate = (instruction: string): Date => {
    // Get the current local time
    const localTime = new Date();

    // Get the timezone offset in minutes
    const timezoneOffset = localTime.getTimezoneOffset();

    // Convert the local time to UTC
    let date = new Date(localTime.getTime() + timezoneOffset * 60 * 1000);

    if (instruction === 'now') {
        return date;
    } else if (instruction.endsWith('y')) {
        const years = parseInt(instruction.slice(0, -1));
        date = addYears(date, years);
    } else if (instruction.endsWith('M')) {
        const months = parseInt(instruction.slice(0, -1));
        date = addMonths(date, months);
    } else if (instruction.endsWith('w')) {
        const weeks = parseInt(instruction.slice(0, -1));
        date = addWeeks(date, weeks);
    } else if (instruction.endsWith('d')) {
        const days = parseInt(instruction.slice(0, -1));
        date = addDays(date, days);
    } else if (instruction.endsWith('h')) {
        const hours = parseInt(instruction.slice(0, -1));
        date = addHours(date, hours);
    } else if (/^(1[012]|[1-9])(:[0-5]\d)?\s*[ap]m$/i.test(instruction)) {
        const [time, meridiem] = instruction.split(' ');
        // eslint-disable-next-line prefer-const
        let [hours, minutes = 0] = time.split(':').map((num) => parseInt(num));
        if (hours === 12 && meridiem === 'am') {
            hours = 0; // midnight
        } else if (hours !== 12 && meridiem === 'pm') {
            hours += 12; // afternoon/evening
        }
        if (hours < 1 || hours > 12) {
            throw new Error(`Invalid hour value in time string: ${instruction}`);
        }
        date.setUTCHours(hours);
        date.setUTCMinutes(minutes);
        date.setUTCSeconds(0);
    } else if (instruction.endsWith('m')) {
        const minutes = parseInt(instruction.slice(0, -1));
        date = addMinutes(date, minutes);
    } else if (instruction.endsWith('s')) {
        const seconds = parseInt(instruction.slice(0, -1));
        date = addSeconds(date, seconds);
    } else if (instruction.endsWith('ms')) {
        const milliseconds = parseInt(instruction.slice(0, -2));
        date = addMilliseconds(date, milliseconds);
    }

    return date;
};

export { formatDate, formatDateNow };
