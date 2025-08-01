import logger from '../core/Logger.js';

/**
 * Base Backend class that all backend implementations extend
 */
export class Backend {
    constructor(name, type, config = {}) {
        this.name = name || 'Default Backend';
        this.type = type || 'generic';
        this.config = config;
        this.id = crypto.randomUUID();
        this.createdAt = new Date();
        
        // Initialize logger with context
        this.logger = logger.withContext(`${this.type}:${this.name}`);
        
        this.logger.info('Backend created', {
            name: this.name,
            id: this.id,
            type: this.type,
            event: 'backend_created'
        });
    }

    /**
     * Process a user prompt - to be implemented by subclasses
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} Backend response result
     */
    async process(userPrompt) {
        throw new Error('Backend.process() must be implemented by subclass');
    }

    /**
     * Get detailed information about this backend
     * @returns {object} Complete backend details
     */
    getDetails() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            config: this.config,
            createdAt: this.createdAt
        };
    }

    /**
     * Validate the backend configuration
     * @returns {object} Validation result
     */
    validate() {
        return {
            valid: true,
            issues: []
        };
    }

    /**
     * Export backend to JSON-serializable configuration
     * @returns {object} JSON configuration
     */
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            ...this.config
        };
    }
}

export default Backend;
