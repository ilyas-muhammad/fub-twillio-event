import 'dotenv/config';
import 'reflect-metadata';
import { EventBridgeHandler, EventBridgeEvent, Context } from 'aws-lambda';
import { In, LessThan } from 'typeorm';
import { logger, initializeLogger, getErrorMessage, sendMessages } from '../../helpers';
import { dataSource, dbInitialization, FubClient, NoteProcessingQueue } from '../../repository';
import { NoteProcessingQueueStatus } from '../../constants';

type Response = void | string;
const LOG_PREFIX = 'note-processing-event-handler|';
export const handler: EventBridgeHandler<string, unknown, unknown> = async (
    event: EventBridgeEvent<string, unknown>,
    context: Context,
) => {
    initializeLogger(context.awsRequestId);
    logger.debug({ eventType: `${LOG_PREFIX}input`, data: { event, context } });
    let response: Response;

    try {
        await dbInitialization(logger);
        const now = new Date();
        const queue = await dataSource.getRepository(NoteProcessingQueue).find({
            where: {
                status: NoteProcessingQueueStatus.IDLE,
                timestamp: LessThan(now),
            },
        });

        const clientIds = queue.map(({ clientId }) => clientId);
        const clients = await dataSource.getRepository(FubClient).find({
            where: { id: In(clientIds) },
        });

        const messages = queue.map((item) => {
            return {
                ...item,
                client: clients.find(({ id }) => id === item.clientId),
            };
        });

        await sendMessages(messages);

        const updatedQueue = await dataSource.getRepository(NoteProcessingQueue).save(
            queue.map((item) => {
                return {
                    ...item,
                    status: NoteProcessingQueueStatus.PROCESSING,
                };
            }),
        );

        logger.debug({ eventType: `${LOG_PREFIX}pg-output`, data: { updatedQueue } });
    } catch (err) {
        logger.error(`Error: ${getErrorMessage(err)}`);
        if (err instanceof Error) {
            logger.error(`Error stack trace: ${err.stack}`);
        }
        response = getErrorMessage(err);
    }

    logger.debug({ eventType: `${LOG_PREFIX}output`, data: { response } });
    return response;
};
