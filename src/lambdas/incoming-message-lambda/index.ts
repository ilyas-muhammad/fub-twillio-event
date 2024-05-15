import 'dotenv/config';
import 'reflect-metadata';
import { SQSHandler, SQSEvent, Context, SQSBatchResponse } from 'aws-lambda';

import {
    logger,
    initializeLogger,
    parseRecords,
    getErrorMessage,
    getKeysFromClientTwilioNumber,
    getPersonIdByPhoneNumber,
    recordIncomingMessage,
} from '../../helpers';
import { TwilioMessage } from '../../types/twilio-message';

type Response = void | SQSBatchResponse;
const LOG_PREFIX = 'incoming-message-event-handler|';
export const handler: SQSHandler = async (event: SQSEvent, context: Context) => {
    initializeLogger(context.awsRequestId);
    logger.debug({ eventType: `${LOG_PREFIX}input`, data: { event, context } });
    let response: Response;
    const rawRecords = event.Records;
    const failedMessageId = rawRecords.map((record) => record.messageId);
    try {
        const records: TwilioMessage[] = parseRecords(rawRecords);
        logger.debug({ eventType: `${LOG_PREFIX}records`, data: { records } });

        const result: unknown[] = [];
        // loop the records
        for (const record of records) {
            const { From: from, To: to, Body: body } = record;
            logger.debug({ eventType: `${LOG_PREFIX}record`, data: { record } });

            const { fubApiKey } = await getKeysFromClientTwilioNumber(to);
            const personId = await getPersonIdByPhoneNumber(fubApiKey, from, LOG_PREFIX);
            const payload = {
                personId,
                fromNumber: from,
                toNumber: to,
                isIncoming: true,
                message: body,
            };
            const res = await recordIncomingMessage(fubApiKey, payload, LOG_PREFIX);

            result.push(res);
        }

        logger.debug({ eventType: `${LOG_PREFIX}output`, data: { result } });
    } catch (err) {
        logger.error(`Error: ${getErrorMessage(err)}`);
        if (err instanceof Error) {
            logger.error(`Error stack trace: ${err.stack}`);
        }

        /**
         * If there are any failed messages, return a SQSBatchResponse object
         * with the failed message ids. This way, SQS will retry the failed.
         */
        response = {
            batchItemFailures: failedMessageId.map((id) => ({
                itemIdentifier: id,
            })),
        };
    }

    logger.debug({ eventType: `${LOG_PREFIX}output`, data: { response } });
    return response;
};
