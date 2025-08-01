import { EventEmitter } from 'events';

/**
 * Logger class for observability in the Injectionator system
 * Provides structured, event-oriented logging with configurable levels
 */
export class Logger extends EventEmitter {
    static LOG_LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };

    constructor(options = {}) {
        super();
        this.level = options.level !== undefined ? options.level : Logger.LOG_LEVELS.INFO;
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

    createLogEntry(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const elapsed = Date.now() - this.startTime;
        
        return {
            timestamp,
            sessionId: this.sessionId,
            level: Object.keys(Logger.LOG_LEVELS)[level],
            context: this.context,
            message,
            elapsed,
            ...data
        };
    }

    debug(message, data = {}) {
        if (this.shouldLog(Logger.LOG_LEVELS.DEBUG)) {
            const entry = this.createLogEntry(Logger.LOG_LEVELS.DEBUG, message, data);
            this.emit('log', entry);
            console.debug(`[${entry.context}] DEBUG: ${message}`, data);
        }
    }

    info(message, data = {}) {
        if (this.shouldLog(Logger.LOG_LEVELS.INFO)) {
            const entry = this.createLogEntry(Logger.LOG_LEVELS.INFO, message, data);
            this.emit('log', entry);
            console.info(`[${entry.context}] INFO: ${message}`, data);
        }
    }

    warn(message, data = {}) {
        if (this.shouldLog(Logger.LOG_LEVELS.WARN)) {
            const entry = this.createLogEntry(Logger.LOG_LEVELS.WARN, message, data);
            this.emit('log', entry);
            console.warn(`[${entry.context}] WARN: ${message}`, data);
        }
    }

    error(message, data = {}) {
        if (this.shouldLog(Logger.LOG_LEVELS.ERROR)) {
            const entry = this.createLogEntry(Logger.LOG_LEVELS.ERROR, message, data);
            this.emit('log', entry);
            console.error(`[${entry.context}] ERROR: ${message}`, data);
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
            const entry = this.createLogEntry(level, message, {
                event: 'hook_result',
                hookName,
                result,
                processingTime,
                ...data
            });
            this.emit('log', entry);
            console.log(`[${entry.context}] ${message} (${processingTime}ms)`, data);
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

    // Create a child logger with additional context
    child(context, additionalData = {}) {
        const childLogger = new Logger({
            level: this.level,
            context: `${this.context}:${context}`,
            sessionId: this.sessionId
        });

        // Forward events to parent with additional data
        childLogger.on('log', (entry) => {
            const forwardedEntry = { ...entry, ...additionalData };
            this.emit('log', forwardedEntry);
        });

        return childLogger;
    }

    // Get all logs as an array (useful for testing or export)
    getLogs() {
        return this.logs || [];
    }

    // Enable log collection (stores logs in memory)
    enableCollection() {
        this.logs = [];
        this.on('log', (entry) => {
            this.logs.push(entry);
        });
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

export default Logger;
