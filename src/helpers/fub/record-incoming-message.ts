import axios from 'axios';

import { generateFUBHeader } from './generate-fub-header';
import { logger } from '../logger';

interface Input {
    personId: number;
    message: string;
    toNumber: string;
    fromNumber: string;
    isIncoming: boolean;
}
export const recordIncomingMessage = async (apiKey: string, input: Input, logPrefix: string) => {
    const url = `${process.env.FUB_API_ENDPOINT}/textMessages`;
    try {
        logger.debug({ eventType: `${logPrefix}record-incoming-message-input`, data: { url } });
        const res = await axios.post(url, input, { headers: generateFUBHeader(apiKey) });
        const { data, status } = res;
        logger.debug({ eventType: `${logPrefix}record-incoming-message-output`, data: { data, status } });
        return data;
    } catch (err) {
        logger.error({ eventType: `${logPrefix}record-incoming-message-error`, data: { url, err } });
        throw err;
    }
};
