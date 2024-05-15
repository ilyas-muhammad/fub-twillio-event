import winston from 'winston';
import axios from 'axios';
import { generateFUBHeader } from './generate-fub-header';

export const fetchPeopleByIds = async (apiKey: string, ids: number[], logger: winston.Logger, logPrefix: string) => {
    const limit = ids.length < 10 ? 10 : ids.length;
    const url = process.env.FUB_API_ENDPOINT + '/people?id=' + ids.join(',') + `&limit=${limit}`;
    try {
        logger.debug({ eventType: `${logPrefix}fetch-people-input`, data: { url } });
        const res = await axios.get(url, {
            headers: generateFUBHeader(apiKey),
        });
        const { data } = res;
        logger.debug({ eventType: `${logPrefix}fetch-people-output`, data });
        return data?.people ?? [];
    } catch (err) {
        logger.error({ eventType: `${logPrefix}fetch-people-error`, data: { url, err } });
        throw err;
    }
};
