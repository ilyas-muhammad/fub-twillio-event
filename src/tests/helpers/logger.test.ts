import { logger, initializeLogger } from '../../helpers/logger';

describe('Logger Helper', () => {
    it('should initialize logger', () => {
        const requestId = 'xxx';
        initializeLogger(requestId);

        expect(logger.defaultMeta.tid).toBe(requestId);
    });
});
