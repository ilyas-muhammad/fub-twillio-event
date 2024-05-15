import winston from 'winston';

const { combine, timestamp } = winston.format;

export const logger = winston.createLogger({
    defaultMeta: {},
    transports: [
        new winston.transports.Console({
            format: winston.format.json(),
            level: process.env.APP_LOG_LEVEL !== 'debug' ? 'info' : 'debug',
        }),
    ],
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
    ),
});

export function initializeLogger(requestId: string) {
    logger.defaultMeta.tid = requestId;
}
