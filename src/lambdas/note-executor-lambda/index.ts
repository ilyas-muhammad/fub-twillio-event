import 'dotenv/config';
import 'reflect-metadata';
import { SQSHandler, SQSEvent, Context, SQSBatchResponse } from 'aws-lambda';
import {
    logger,
    initializeLogger,
    parseRecords,
    getErrorMessage,
    sendSMS,
    deleteNoteById,
    recordTextMessage,
} from '../../helpers';
import { dataSource, dbInitialization, NoteProcessingQueue } from '../../repository';
import { FuBNoteProcessingQueue } from '../../types';

type Response = void | SQSBatchResponse;
const LOG_PREFIX = 'note-executor-event-handler|';
export const handler: SQSHandler = async (event: SQSEvent, context: Context) => {
    initializeLogger(context.awsRequestId);
    logger.debug({ eventType: `${LOG_PREFIX}input`, data: { event, context } });
    let response: Response;
    const rawRecords = event.Records;
    const failedMessageId = rawRecords.map((record) => record.messageId);
    try {
        await dbInitialization(logger);

        const records = parseRecords(rawRecords);
        logger.debug({ eventType: `${LOG_PREFIX}records`, data: { records } });

        const mappedRecords = records
            .filter(
                ({ id, fubPersonId, fubNoteId, sendToNumber: toNumber, messageBody: body, client }) =>
                    // TODO: handle bad data
                    id &&
                    fubNoteId &&
                    fubPersonId &&
                    toNumber &&
                    body &&
                    client.twilioNumber &&
                    client.twilioSid &&
                    client.twilioAuthToken &&
                    client.fubApiKey,
            )
            .map((record) => {
                const { id, fubNoteId, fubPersonId, sendToNumber: toNumber, messageBody: body, client } = record;

                return {
                    id,
                    fubNoteId,
                    fubPersonId,
                    toNumber,
                    body,
                    twilioNumber: client.twilioNumber,
                    sid: client.twilioSid,
                    authToken: client.twilioAuthToken,
                    fubApiKey: client.fubApiKey,
                };
            });
        const responsesSMS: Partial<FuBNoteProcessingQueue>[] = [];
        for (const record of mappedRecords) {
            const response = await sendSMS(record);
            responsesSMS.push(response);
        }

        const result = await dataSource.getRepository(NoteProcessingQueue).save(responsesSMS);

        const successMessages = responsesSMS.filter((response) => response.status === 200);

        for (const message of successMessages) {
            const { fubApiKey, fubNoteId, fubPersonId, toNumber, twilioNumber, body } =
                mappedRecords.find((record) => record.id === message.id) || {};

            await deleteNoteById(fubApiKey, fubNoteId, logger, LOG_PREFIX);
            await recordTextMessage(fubApiKey, false, {
                personId: fubPersonId,
                message: body,
                toNumber,
                fromNumber: twilioNumber,
            });
        }

        logger.debug({ eventType: `${LOG_PREFIX}pg-output`, data: { result } });
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
