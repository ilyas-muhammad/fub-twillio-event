import axios from 'axios';

import { logger } from '../logger';
import { generateFUBHeader } from './generate-fub-header';

export const recordTextMessage = async (
    apiKey: string,
    isIncoming: boolean,
    input: { personId: number; message: string; toNumber: string; fromNumber: string },
) => {
    const logPrefix = 'record-text-message';
    const url = `${process.env.FUB_API_ENDPOINT}/textMessages`;
    try {
        logger.debug({ eventType: `${logPrefix}-input`, data: { url } });
        const { personId, message, toNumber, fromNumber } = input;
        const body = {
            personId,
            message,
            toNumber,
            fromNumber,
            isIncoming,
        };
        const res = await axios.post(url, body, { headers: generateFUBHeader(apiKey) });
        const { data, status } = res;
        logger.debug({ eventType: `${logPrefix}-output`, data: { data, status } });
        return data;
    } catch (err) {
        logger.error({ eventType: `${logPrefix}-error`, data: { url, err } });
        throw err;
    }
};
