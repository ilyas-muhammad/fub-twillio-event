import axios from 'axios';
import { logger } from '../logger';
import { generateFUBHeader } from './generate-fub-header';

export const getPersonIdByPhoneNumber = async (apiKey: string, phone: string, logPrefix: string): Promise<number> => {
    const url = process.env.FUB_API_ENDPOINT + '/people?phone=' + phone;
    try {
        logger.debug({ eventType: `${logPrefix}fetch-people-by-phone-input`, data: { url } });
        const res = await axios.get(url, {
            headers: generateFUBHeader(apiKey),
        });
        const { data } = res;
        logger.debug({ eventType: `${logPrefix}fetch-people-by-phone-output`, data });

        const people = data?.people ?? [];
        if (!people.length) {
            throw new Error(`No people found for phone number ${phone}`);
        }

        return people[0].id;
    } catch (err) {
        logger.error({ eventType: `${logPrefix}fetch-people-by-phone-error`, data: { url, err } });
        throw err;
    }
};
