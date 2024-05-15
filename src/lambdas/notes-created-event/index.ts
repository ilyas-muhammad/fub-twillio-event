import 'reflect-metadata';
import 'dotenv/config';
import { SQSHandler, SQSEvent, Context, SQSBatchResponse } from 'aws-lambda';
import {
    logger,
    initializeLogger,
    parseRecords,
    getErrorMessage,
    deleteNoteById,
    fetchNotesByIds,
    translateInstructionIntoUTCDate,
    fetchPeopleByIds,
    getPeopleValidPhone,
} from '../../helpers';
import { FubNote, FuBNoteProcessingQueue } from '../../types';
import { dataSource, dbInitialization, FubClient, FubEvent, NoteProcessingQueue } from '../../repository';
import { FUBEventType, NoteProcessingQueueStatus } from '../../constants';

type Response = void | SQSBatchResponse;
const LOG_PREFIX = 'notes-created-event-handler|';
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

        // FIXME: update with real client id from query params
        const clientId = 1;
        const { fubApiKey } = await dataSource.manager.findOneByOrFail(FubClient, { id: clientId });
        if (!fubApiKey) {
            throw new Error(`No FUB API Key in Client with id ${clientId} not found`);
        }

        const resourcesIds = records.map(({ resourceIds }) => resourceIds);
        // get resourceIds from array of arrays of numbers resourcesIds
        const resourceIds = resourcesIds.flat();

        // get event details from each record by calling fub uri
        const notes = await fetchNotesByIds(fubApiKey, resourceIds, logger, LOG_PREFIX);

        const eventType = FUBEventType.NOTES_CREATED;
        const createdAt = new Date();
        const mapNoteEventId: Record<string, number[]> = records.reduce((acc, { eventId, resourceIds }) => {
            acc[eventId] = resourceIds;
            return acc;
        }, {});

        const personIds = notes.map((note) => note.personId);
        const people = await fetchPeopleByIds(fubApiKey, personIds, logger, LOG_PREFIX);

        // find instructions for each record
        const notesToDelete: FubNote[] = [];
        const notesToProcess: Omit<FuBNoteProcessingQueue, 'id'>[] = [];
        const instructionPatternRegex = /{{\s*([\w:]+\s*[ap]?m?)\s*}}/i;
        const mappedNote = notes.map((note) => {
            const resourceId = note.id;
            const eventId = Object.keys(mapNoteEventId).find((key) => mapNoteEventId[key].includes(resourceId));

            const person = people.find((p) => p.id === note.personId);
            const result = {
                clientId,
                fubEventId: eventId,
                noteId: resourceId,
                eventDetails: note,
                eventType,
                createdAt: createdAt,
            };
            const content = note?.body ?? '';
            const match = content?.match(instructionPatternRegex);
            if (match && !match.length) {
                notesToDelete.push(note);
                return result;
            }
            notesToProcess.push({
                fubNoteId: resourceId,
                fubPersonId: person.id,
                clientId,
                fubEventId: eventId ?? '',
                sendToNumber: getPeopleValidPhone(person) ?? '',
                status: NoteProcessingQueueStatus.IDLE,
                timestamp: translateInstructionIntoUTCDate((match[1] ?? '').trim()),
                createdAt,
            });

            return result;
        });
        // store event to
        await dataSource.createQueryBuilder().insert().into(FubEvent).values(mappedNote).execute();

        // store notes to process
        if (notesToProcess.length) {
            await dataSource
                .createQueryBuilder()
                .insert()
                .into(NoteProcessingQueue)
                .values(notesToProcess as never[])
                .execute();
        }
        // delete notes that don't have an instructions
        if (notesToDelete.length) {
            const promisesDelete = notesToDelete.map((note) => deleteNoteById(fubApiKey, note.id, logger, LOG_PREFIX));
            await Promise.all(promisesDelete);
        }
    } catch (err) {
        logger.error(`Error: ${getErrorMessage(err)}`);
        if (err instanceof Error) {
            logger.debug(`Error stack trace: ${err.stack}`);
        }

        response = {
            batchItemFailures: failedMessageId.map((id) => ({
                itemIdentifier: id,
            })),
        };
    }

    logger.debug({ eventType: `${LOG_PREFIX}output`, data: { response } });
    return response;
};
