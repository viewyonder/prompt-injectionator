import logger, { Logger } from '../src/Logger.js';

describe('Logger', () => {
    let testLogger;

    beforeEach(() => {
        // Use context-aware logger for testing
        testLogger = logger.withContext('TestContext');
        testLogger.setLevel('DEBUG');
        testLogger.enableCollection(); // Enable log collection for testing
    });

    describe('Basic Logging', () => {
        test('should create logger with context', () => {
            expect(testLogger.context).toBe('TestContext');
            expect(testLogger.getLevel()).toBe('DEBUG');
        });

        test('should log debug messages', () => {
            testLogger.debug('Debug message', { extra: 'data' });
            
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('DEBUG');
            expect(logs[0].message).toBe('Debug message');
            expect(logs[0].extra).toBe('data');
        });

        test('should log info messages', () => {
            testLogger.info('Info message');
            
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('INFO');
            expect(logs[0].message).toBe('Info message');
        });

        test('should log warn messages', () => {
            testLogger.warn('Warning message');
            
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('WARN');
            expect(logs[0].message).toBe('Warning message');
        });

        test('should log error messages', () => {
            testLogger.error('Error message');
            
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('ERROR');
            expect(logs[0].message).toBe('Error message');
        });
    });

    describe('Log Levels', () => {
        test('should respect log levels', () => {
            // Set to INFO level
            logger.setLevel('INFO');
            
            logger.debug('Debug message'); // Should be filtered out
            logger.info('Info message');   // Should be logged
            logger.warn('Warning message'); // Should be logged
            
            const logs = logger.getLogs();
            expect(logs).toHaveLength(2);
            expect(logs[0].level).toBe('INFO');
            expect(logs[1].level).toBe('WARN');
        });

        test('should change log level dynamically', () => {
            logger.setLevel(Logger.LOG_LEVELS.ERROR);
            expect(logger.getLevel()).toBe('ERROR');
            
            logger.info('Info message'); // Should be filtered out
            logger.error('Error message'); // Should be logged
            
            const logs = logger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('ERROR');
        });
    });

    describe('Convenience Methods', () => {
        test('should log execution start', () => {
            logger.startExecution('TestComponent', { testData: 'value' });
            
            const logs = logger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].message).toBe('Starting execution');
            expect(logs[0].component).toBe('TestComponent');
            expect(logs[0].event).toBe('execution_start');
            expect(logs[0].testData).toBe('value');
        });

        test('should log execution end', () => {
            logger.endExecution('TestComponent', 'SUCCESS', { duration: 100 });
            
            const logs = logger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].message).toBe('Execution completed');
            expect(logs[0].component).toBe('TestComponent');
            expect(logs[0].result).toBe('SUCCESS');
            expect(logs[0].event).toBe('execution_end');
            expect(logs[0].duration).toBe(100);
        });

        test('should log hook results', () => {
            logger.hookResult('TestHook', 'PASS', 50, { extra: 'info' });
            
            const logs = logger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].message).toBe('Hook TestHook: PASS');
            expect(logs[0].event).toBe('hook_result');
            expect(logs[0].hookName).toBe('TestHook');
            expect(logs[0].result).toBe('PASS');
            expect(logs[0].processingTime).toBe(50);
            expect(logs[0].extra).toBe('info');
        });

        test('should log backend calls', () => {
            logger.backendCall('LLMBackend', 200, { success: true });
            
            const logs = logger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].message).toBe('Backend call completed');
            expect(logs[0].event).toBe('backend_call');
            expect(logs[0].backendType).toBe('LLMBackend');
            expect(logs[0].processingTime).toBe(200);
            expect(logs[0].success).toBe(true);
        });
    });

    describe('Child Loggers', () => {
        test('should create child logger with extended context', () => {
            const childLogger = logger.child('ChildContext', { parentId: 'test-123' });
            childLogger.enableCollection();
            
            childLogger.info('Child message');
            
            const childLogs = childLogger.getLogs();
            expect(childLogs).toHaveLength(1);
            expect(childLogs[0].context).toBe('TestContext:ChildContext');
            // Additional data is forwarded to parent, not stored in child logs directly
            expect(childLogs[0].parentId).toBeUndefined();
            
            // Check that parent receives the additional data
            const parentLogs = logger.getLogs();
            const forwardedEntry = parentLogs.find(entry => entry.message === 'Child message');
            expect(forwardedEntry).toBeDefined();
            expect(forwardedEntry.parentId).toBe('test-123');
        });

        test('should forward child events to parent', (done) => {
            const childLogger = logger.child('ChildContext');
            
            logger.on('log', (entry) => {
                expect(entry.context).toBe('TestContext:ChildContext');
                expect(entry.message).toBe('Child message');
                done();
            });
            
            childLogger.info('Child message');
        });
    });

    describe('Event Emission', () => {
        test('should emit log events', (done) => {
            logger.on('log', (entry) => {
                expect(entry.level).toBe('INFO');
                expect(entry.message).toBe('Test message');
                expect(entry.context).toBe('TestContext');
                expect(entry.sessionId).toBeDefined();
                expect(entry.timestamp).toBeDefined();
                expect(entry.elapsed).toBeGreaterThanOrEqual(0);
                done();
            });
            
            logger.info('Test message');
        });

        test('should include session ID in all logs', () => {
            logger.info('Message 1');
            logger.info('Message 2');
            
            const logs = logger.getLogs();
            expect(logs).toHaveLength(2);
            expect(logs[0].sessionId).toBe(logs[1].sessionId);
        });

        test('should track elapsed time', (done) => {
            logger.info('First message');
            
            // Wait a bit
            setTimeout(() => {
                logger.info('Second message');
                
                const logs = logger.getLogs();
                expect(logs).toHaveLength(2);
                expect(logs[1].elapsed).toBeGreaterThan(logs[0].elapsed);
                done();
            }, 10);
        });
    });
});
