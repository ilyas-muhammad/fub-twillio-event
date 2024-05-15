import AWS from 'aws-sdk';
import { logger } from '../logger';

export const sendMessage = async (message: string): Promise<void> => {
    const sqs = new AWS.SQS();
    const params = {
        MessageBody: message,
        QueueUrl: process.env.QUEUE_URL ?? '',
    };
    await sqs.sendMessage(params).promise();
};

export const sendMessages = async (messages: Record<string, unknown>[]): Promise<void> => {
    logger.debug({ eventType: 'sendMessages-input', data: { messages } });
    const sqs = new AWS.SQS();
    const queueUrl = process.env.NOTES_PROCESSING_QUEUE_URL ?? '';
    const params: AWS.SQS.SendMessageRequest[] = messages.map((message) => ({
        MessageBody: JSON.stringify(message),
        QueueUrl: queueUrl,
    }));

    logger.debug({ eventType: 'sendMessages-params', data: { params, queueUrl } });

    for (const param of params) {
        logger.debug({ eventType: 'sendMessages-publishing', data: { param } });
        try {
            const result = await sqs.sendMessage(param).promise();
            logger.debug({ eventType: 'sendMessages-result', data: { result } });
        } catch (err) {
            logger.error({ eventType: 'sendMessages-error', data: { param, err } });
            throw err;
        }
    }
};
