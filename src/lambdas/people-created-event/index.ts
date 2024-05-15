import 'dotenv/config';
import 'reflect-metadata';
import { SQSHandler, SQSEvent, Context, SQSBatchResponse } from 'aws-lambda';
import {
    logger,
    initializeLogger,
    fetchPeopleByIds,
    parseRecords,
    getErrorMessage,
    getKeysFromClientId,
} from '../../helpers';
import { dataSource, dbInitialization, FubEvent } from '../../repository';
import { FUBEventType } from '../../constants/fub-event-type';

type Response = void | SQSBatchResponse;
const LOG_PREFIX = 'people-created-event-handler|';
export const handler: SQSHandler = async (event: SQSEvent, context: Context) => {
    initializeLogger(context.awsRequestId);
    logger.debug({ eventType: `${LOG_PREFIX}input`, data: { event, context } });
    let response: Response;
    const rawRecords = event.Records;
    const failedMessageId = rawRecords.map((record) => record.messageId);
    try {
        await dbInitialization(logger);

        const records = parseRecords(rawRecords);
        logger.info({ eventType: `${LOG_PREFIX}records`, data: { records } });

        // FIXME: update with real client id from query params
        const clientId = 1;
        const { fubApiKey } = await getKeysFromClientId(clientId);

        const resourcesIds = records.map(({ resourceIds }) => resourceIds);
        // get resourceIds from array of arrays of numbers resourcesIds
        const resourceIds = resourcesIds.flat();

        // get event details from each record by calling fub uri
        const people = await fetchPeopleByIds(fubApiKey, resourceIds, logger, LOG_PREFIX);

        logger.info({ eventType: `${LOG_PREFIX}people`, data: { people } });
        const eventType = FUBEventType.PEOPLE_CREATED;
        const createdAt = new Date();
        const mapPersonEventId: Record<string, number[]> = records.reduce((acc, { eventId, resourceIds }) => {
            acc[eventId] = resourceIds;
            return acc;
        }, {});
        const mappedPeople = people.map((person) => {
            const eventId = Object.keys(mapPersonEventId).find((key) => mapPersonEventId[key].includes(person.id));
            const resourceId = person.id;
            return {
                clientId,
                fubEventId: eventId,
                personId: resourceId,
                eventDetails: person,
                eventType,
                createdAt: createdAt,
            };
        });
        // store data to pg
        const result = await dataSource.createQueryBuilder().insert().into(FubEvent).values(mappedPeople).execute();

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
