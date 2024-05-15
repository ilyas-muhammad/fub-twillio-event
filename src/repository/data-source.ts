import { DataSource } from 'typeorm';
import winston from 'winston';

import { FubClient, FubEvent, NoteProcessingQueue } from './entities';

export const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
    username: process.env.PG_USER || '',
    password: process.env.PG_PASSWORD || '',
    database: process.env.PG_DATABASE || '',
    synchronize: true,
    logging: process.env?.APP_LOG_LEVEL === 'debug' ? true : false,
    entities: [FubEvent, FubClient, NoteProcessingQueue],
    subscribers: [],
    migrations: [],
});

export const dbInitialization = async (logger: winston.Logger) => {
    try {
        await dataSource.initialize();
    } catch (err) {
        logger.error(`dbInitialization-error: ${err}`);
        throw err;
    }
};
