#!/usr/bin/env node

/**
 * Singleton Logger Demo
 * 
 * This demonstrates the new centralized Singleton Logger with:
 * - Single shared instance across all classes
 * - Context-aware logging
 * - Optional async queueing
 * - Environment-based configuration
 * - Structured JSON logs
 */

import logger, { Logger } from '../src/Logger.js';
import { Injectionator } from '../src/core/Injectionator.js';
import { LLMBackend } from '../src/core/Backend.js';
import { SendChain, ReceiveChain } from '../src/core/Chain.js';

console.log('=== Singleton Logger Demo ===\n');

// Configure logger for demo
logger.setLevel('DEBUG');
logger.enableCollection();

// Show that the Logger is a singleton
console.log('1. Singleton Pattern Verification:');
const logger1 = new Logger();
const logger2 = new Logger();
console.log('logger1 === logger2:', logger1 === logger2);
console.log('Both reference the same instance:', logger === logger1);
console.log('');

// Demonstrate context-aware logging
console.log('2. Context-Aware Logging:');
const appLogger = logger.withContext('App');
const dbLogger = logger.withContext('Database');
const apiLogger = logger.withContext('API');

appLogger.info('Application started');
dbLogger.info('Database connection established');
apiLogger.info('API server listening on port 3000');

console.log('Recent logs:');
logger.getLogs().slice(-3).forEach(log => {
    console.log(`[${log.context}] ${log.level}: ${log.message}`);
});
console.log('');

// Demonstrate child loggers
console.log('3. Child Logger with Hierarchical Context:');
const childLogger = appLogger.child('UserService');
childLogger.info('User authentication successful', { userId: 12345 });

console.log('Recent log with child context:');
const recentLog = logger.getLogs().slice(-1)[0];
console.log(`[${recentLog.context}] ${recentLog.level}: ${recentLog.message}`);
console.log('');

// Demonstrate structured logging with metadata
console.log('4. Structured Logging with Metadata:');
logger.info('User action performed', {
    userId: 12345,
    action: 'file_upload',
    fileSize: 2048576,
    duration: 150,
    success: true
});

const structuredLog = logger.getLogs().slice(-1)[0];
console.log('Structured log entry:', JSON.stringify(structuredLog, null, 2));
console.log('');

// Demonstrate integration with Injectionator classes
console.log('5. Integration with Core Classes:');

// Create a simple backend
const backend = new LLMBackend('Demo LLM', {
    provider: 'demo',
    model: 'demo-model'
});

// Create chains
const sendChain = new SendChain('Demo Send Chain', 'Demo chain for testing', null, backend);
const receiveChain = new ReceiveChain('Demo Receive Chain', 'Demo receive chain', null, 'user');

// Create injectionator
const injectionator = new Injectionator(
    'Demo Injectionator',
    'Demo injectionator for testing',
    'https://github.com/example/demo',
    sendChain,
    receiveChain,
    backend
);

console.log('All classes now use the same logger instance with different contexts:');
logger.getLogs().slice(-4).forEach(log => {
    console.log(`[${log.context}] ${log.event || 'general'}: ${log.message}`);
});
console.log('');

// Demonstrate log levels
console.log('6. Log Level Filtering:');
logger.setLevel('WARN');
logger.debug('This debug message will be filtered out');
logger.info('This info message will be filtered out');  
logger.warn('This warning will be shown');
logger.error('This error will be shown');

console.log('Only WARN and ERROR messages after setting level to WARN:');
logger.getLogs().slice(-2).forEach(log => {
    console.log(`${log.level}: ${log.message}`);
});
console.log('');

// Demonstrate convenience methods
console.log('7. Convenience Methods for Common Events:');
logger.setLevel('INFO'); // Reset level

logger.startExecution('DemoComponent', { requestId: 'req-123' });
logger.hookResult('SecurityHook', 'PASS', 25, { ruleCount: 5 });
logger.backendCall('LLMBackend', 150, { tokens: 50 });
logger.endExecution('DemoComponent', 'SUCCESS', { totalTime: 200 });

console.log('Convenience method logs:');
logger.getLogs().slice(-4).forEach(log => {
    console.log(`${log.event}: ${log.message} (${log.elapsed}ms elapsed)`);
});
console.log('');

// Show session consistency
console.log('8. Session ID Consistency:');
const sessionId = logger.sessionId;
console.log('All logs share the same session ID:', sessionId);
console.log('Logs from different contexts all have session:', 
    logger.getLogs().every(log => log.sessionId === sessionId));
console.log('');

// Environment configuration example
console.log('9. Environment Configuration:');
console.log('Current configuration:');
console.log('- Level:', logger.getLevel());
console.log('- Queue enabled:', logger.useQueue);
console.log('- Output file:', logger.outputFile);
console.log('');
console.log('To configure via environment variables:');
console.log('LOGGER_LEVEL=ERROR LOGGER_USE_QUEUE=true LOGGER_OUTPUT_FILE=./app.log node demo/singleton-logger-demo.js');
console.log('');

console.log('=== Demo Complete ===');
console.log(`Total logs generated: ${logger.getLogs().length}`);
console.log('All logs are structured JSON and include timestamps, session IDs, and context information.');
