import winston from 'winston';
import axios from 'axios';
import { generateFUBHeader } from './generate-fub-header';

export const fetchNotesByIds = async (apiKey: string, ids: number[], logger: winston.Logger, logPrefix: string) => {
    const limit = ids.length < 10 ? 10 : ids.length;
    const url = process.env.FUB_API_ENDPOINT + '/notes?id=' + ids.join(',') + `&limit=${limit}`;
    try {
        logger.debug({ eventType: `${logPrefix}fetch-notes-input`, data: { url } });
        const res = await axios.get(url, {
            headers: generateFUBHeader(apiKey),
        });
        const { data } = res;
        logger.debug({ eventType: `${logPrefix}fetch-notes-output`, data });
        return data?.notes ?? [];
    } catch (err) {
        logger.error({ eventType: `${logPrefix}fetch-notes-error`, data: { url, err } });
        throw err;
    }
};
