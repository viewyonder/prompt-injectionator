import { EventEmitter } from 'events';
import { writeFile } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Logger Singleton class for centralized logging with structured JSON format
 */
class Logger extends EventEmitter {
    static LOG_LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };

    static instance;

    constructor(options = {}) {
        super();
        if (Logger.instance) {
            return Logger.instance;
        }
        Logger.instance = this;

        this.queue = [];
        this.useQueue = process.env.LOGGER_USE_QUEUE === 'true';

        this.level = process.env.LOGGER_LEVEL ? 
            (Logger.LOG_LEVELS[process.env.LOGGER_LEVEL.toUpperCase()] || Logger.LOG_LEVELS.INFO) :
            (options.level || Logger.LOG_LEVELS.INFO);

        this.outputFile = process.env.LOGGER_OUTPUT_FILE || resolve(__dirname, 'app.log');

        this.context = options.context || 'System';
        this.sessionId = options.sessionId || this.generateSessionId();
        this.startTime = Date.now();
    }

    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    shouldLog(level) {
        return level >= this.level;
    }

    async logToFile(entry) {
        const logMessage = JSON.stringify(entry) + '\n';
        writeFile(this.outputFile, logMessage, { flag: 'a' }, (err) => {
            if (err) {
                console.error('Failed to write log:', err);
            }
        });
    }

    async processQueue() {
        while (this.queue.length) {
            const entry = this.queue.shift();
            await this.logToFile(entry);
        }
    }

    createLogEntry(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const elapsed = Date.now() - this.startTime;

        const entry = {
            timestamp,
            sessionId: this.sessionId,
            level: Object.keys(Logger.LOG_LEVELS)[level],
            context: this.context,
            message,
            elapsed,
            ...(this.additionalData || {}),
            ...data
        };

        // Emit the event synchronously on the singleton instance
        Logger.instance.emit('log', entry);
        
        // Handle file logging asynchronously without blocking
        if (this.useQueue) {
            this.queue.push(entry);
            setImmediate(() => this.processQueue());
        } else {
            setImmediate(() => this.logToFile(entry));
        }
    }

    debug(message, data = {}) {
        if (this.shouldLog(Logger.LOG_LEVELS.DEBUG)) {
            this.createLogEntry(Logger.LOG_LEVELS.DEBUG, message, data);
        }
    }

    info(message, data = {}) {
        if (this.shouldLog(Logger.LOG_LEVELS.INFO)) {
            this.createLogEntry(Logger.LOG_LEVELS.INFO, message, data);
        }
    }

    warn(message, data = {}) {
        if (this.shouldLog(Logger.LOG_LEVELS.WARN)) {
            this.createLogEntry(Logger.LOG_LEVELS.WARN, message, data);
        }
    }

    error(message, data = {}) {
        if (this.shouldLog(Logger.LOG_LEVELS.ERROR)) {
            this.createLogEntry(Logger.LOG_LEVELS.ERROR, message, data);
        }
    }

    // Convenience methods for common Injectionator events
    startExecution(component, data = {}) {
        this.info(`Starting execution`, {
            component,
            event: 'execution_start',
            ...data
        });
    }

    endExecution(component, result, data = {}) {
        this.info(`Execution completed`, {
            component,
            event: 'execution_end',
            result,
            ...data
        });
    }

    hookResult(hookName, result, processingTime, data = {}) {
        const level = result === 'PASS' ? Logger.LOG_LEVELS.INFO : Logger.LOG_LEVELS.WARN;
        const message = `Hook ${hookName}: ${result}`;
        
        if (this.shouldLog(level)) {
            this.createLogEntry(level, message, {
                event: 'hook_result',
                hookName,
                result,
                processingTime,
                ...data
            });
        }
    }

    backendCall(backendType, processingTime, data = {}) {
        this.info(`Backend call completed`, {
            event: 'backend_call',
            backendType,
            processingTime,
            ...data
        });
    }

    // Create a context-aware logger with additional context
    withContext(context, additionalData = {}) {
        const contextualLogger = Object.create(this);
        contextualLogger.context = context;
        contextualLogger.additionalData = { ...this.additionalData, ...additionalData };
        contextualLogger.logs = this.logs; // Share the same logs array
        
        return contextualLogger;
    }

    // Create a child logger with additional context
    child(context, additionalData = {}) {
        return this.withContext(`${this.context}:${context}`, additionalData);
    }

    // Get all logs as an array (useful for testing or export)
    getLogs() {
        return this.logs || [];
    }

    // Enable log collection (stores logs in memory)
    enableCollection() {
        if (!this.logs) {
            this.logs = [];
        }
        // Remove existing listeners to avoid duplicates
        this.removeAllListeners('log');
        this.on('log', (entry) => {
            this.logs.push(entry);
        });
    }

    // Clear collected logs
    clearLogs() {
        if (this.logs) {
            this.logs.length = 0;
        }
    }

    // Reset logger state (useful for testing)
    reset() {
        this.clearLogs();
        this.removeAllListeners();
        this.level = Logger.LOG_LEVELS.INFO;
        this.context = 'System';
        this.additionalData = {};
    }

    // Set log level dynamically
    setLevel(level) {
        if (typeof level === 'string') {
            this.level = Logger.LOG_LEVELS[level.toUpperCase()];
        } else {
            this.level = level;
        }
    }

    // Get current log level as string
    getLevel() {
        return Object.keys(Logger.LOG_LEVELS)[this.level];
    }
}

const globalLogger = new Logger();

export { Logger };
export default globalLogger;
