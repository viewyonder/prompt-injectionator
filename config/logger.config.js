/**
 * Logger Configuration
 * 
 * Environment Variables for Logger Configuration:
 * 
 * LOGGER_LEVEL: Set the log level (DEBUG, INFO, WARN, ERROR)
 * LOGGER_USE_QUEUE: Enable async logging queue (true/false)
 * LOGGER_OUTPUT_FILE: Set custom log file path
 * 
 * Example usage:
 * 
 * // In production
 * LOGGER_LEVEL=ERROR LOGGER_USE_QUEUE=true node app.js
 * 
 * // In development
 * LOGGER_LEVEL=DEBUG LOGGER_OUTPUT_FILE=./dev.log node app.js
 * 
 * // Default behavior (no env vars set)
 * // Level: INFO, Queue: disabled, File: src/app.log
 */

export const DEFAULT_CONFIG = {
    level: 'INFO',
    useQueue: false,
    outputFile: 'app.log',
    context: 'System'
};

// Example configurations for different environments
export const ENVIRONMENTS = {
    development: {
        level: 'DEBUG',
        useQueue: false,
        outputFile: './logs/dev.log'
    },
    
    staging: {
        level: 'INFO',
        useQueue: true,
        outputFile: './logs/staging.log'
    },
    
    production: {
        level: 'WARN',
        useQueue: true,
        outputFile: './logs/production.log'
    }
};

/**
 * Get configuration based on NODE_ENV
 */
export function getEnvironmentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return ENVIRONMENTS[env] || ENVIRONMENTS.development;
}
