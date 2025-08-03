import { jest } from '@jest/globals';
import logger, { Logger } from '../../src/core/Logger.js';

describe('Logger', () => {
    beforeEach(() => {
        // Reset the logger state before each test to ensure isolation
        logger.reset();
        // Spy on console methods to verify output
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore original console methods after each test
        jest.restoreAllMocks();
    });

    it('should log info messages correctly', () => {
        logger.info('This is an info message');
        expect(console.log).toHaveBeenCalled();
        const logEntry = JSON.parse(console.log.mock.calls[0][0]);
        expect(logEntry.level).toBe('INFO');
        expect(logEntry.message).toBe('This is an info message');
    });

    it('should log error messages correctly', () => {
        logger.error('This is an error message');
        expect(console.error).toHaveBeenCalled();
        const logEntry = JSON.parse(console.error.mock.calls[0][0]);
        expect(logEntry.level).toBe('ERROR');
        expect(logEntry.message).toBe('This is an error message');
    });

    it('should not log debug messages if level is INFO', () => {
        logger.setLevel('INFO');
        logger.debug('This should not be logged');
        expect(console.log).not.toHaveBeenCalled();
    });

    it('should log debug messages if level is DEBUG', () => {
        logger.setLevel('DEBUG');
        logger.debug('This should be logged');
        expect(console.log).toHaveBeenCalled();
    });

    it('should create a contextual logger', () => {
        const contextualLogger = logger.withContext('TestContext');
        contextualLogger.info('A contextual message');
        expect(console.log).toHaveBeenCalled();
        const logEntry = JSON.parse(console.log.mock.calls[0][0]);
        expect(logEntry.context).toBe('TestContext');
    });

    it('should collect logs when collection is enabled', () => {
        logger.enableCollection();
        logger.info('First message');
        logger.warn('Second message');
        const logs = logger.getLogs();
        expect(logs).toHaveLength(2);
        expect(logs[0].message).toBe('First message');
        expect(logs[1].level).toBe('WARN');
    });
});
