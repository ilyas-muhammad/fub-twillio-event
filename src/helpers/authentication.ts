import crypto from 'crypto';
import { logger } from './logger';

const LOG_PREFIX = 'authenticate-fub-webhook|';
const FUB_API_KEY = process.env.FUB_API_KEY || '';

/**
 * Authenticate FUB webhook
 * @see https://docs.followupboss.com/reference/webhooks-guide#verify-the-request
 *
 * @param payload - json (non-prettified) payload from FUB webhook
 * @param signature - signature from `FUB-Signature` header FUB webhook
 * @returns - true if signature is valid
 */
export const authenticateFUBSignature = (payload: unknown, signature: string): boolean => {
    logger.debug({
        eventType: `${LOG_PREFIX}-input`,
        data: { payload, signature },
    });

    if (!signature) {
        logger.error({
            eventType: `${LOG_PREFIX}-unauthenticated`,
            signature,
        });

        throw new Error('Unauthenticated');
    }

    const generated = crypto
        .createHmac('sha256', FUB_API_KEY)
        .update(Buffer.from(payload as string, 'utf-8').toString('base64'))
        .digest('hex');

    if (signature !== generated) {
        logger.error({
            eventType: `${LOG_PREFIX}-generated-signature-not-match`,
            signature,
        });
        throw new Error('Unauthenticated');
    }

    logger.debug({
        eventType: `${LOG_PREFIX}-output`,
        data: { signature },
    });

    return true;
};
