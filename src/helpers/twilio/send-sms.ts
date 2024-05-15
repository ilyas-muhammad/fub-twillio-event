import twilio from 'twilio';
import { logger } from '../logger';

export const sendSMS = async (input: {
    id: number;
    sid: string;
    authToken: string;
    twilioNumber: string;
    toNumber: string;
    body: string;
}) => {
    logger.debug({ eventType: 'sendSMS-input', data: { input } });
    const { id, sid, authToken, twilioNumber, toNumber, body } = input;
    const accountSid = sid;
    const client = twilio(accountSid, authToken);

    const request = {
        body,
        from: twilioNumber,
        to: toNumber,
    };

    let response = { status: 0, message: {} };
    try {
        logger.debug({ eventType: 'sendSMS-request', data: { request } });
        const res = await client.messages.create(request);
        response = { status: 200, message: res };
    } catch (err) {
        response = {
            status: err?.status ?? 500,
            message: err?.message ?? 'Unknown error',
        };
    }

    logger.debug({ eventType: 'sendSMS-output', data: { response } });

    return {
        id,
        status: response.status,
        requestBody: request,
        responseBody: response,
        updatedAt: new Date(),
    };
};
