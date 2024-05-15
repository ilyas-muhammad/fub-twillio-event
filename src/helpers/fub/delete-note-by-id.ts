import winston from 'winston';
import axios from 'axios';

import { generateFUBHeader } from './generate-fub-header';

export const deleteNoteById = async (apiKey: string, noteId: number, logger: winston.Logger, logPrefix: string) => {
    const url = `${process.env.FUB_API_ENDPOINT}/notes/${noteId}`;
    try {
        logger.debug({ eventType: `${logPrefix}delete-note-by-id-input`, data: { url } });
        const res = await axios.delete(url, { headers: generateFUBHeader(apiKey) });
        const { data, status } = res;
        logger.debug({ eventType: `${logPrefix}delete-note-by-id-output`, data: { data, status } });
        return data;
    } catch (err) {
        logger.error({ eventType: `${logPrefix}delete-note-by-id-error`, data: { url, err } });
        throw err;
    }
};
