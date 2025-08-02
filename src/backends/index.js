/**
 * Backends Index - Central export point for all backend implementations
 */

// Base backend class
export { Backend } from './Backend.js';

// Backend implementations
export { LLMBackend } from './LLMBackend.js';
export { WebhookBackend } from './WebhookBackend.js';
export { GeminiBackend } from './GeminiBackend.js';

// Default exports for convenience
export { default as BackendBase } from './Backend.js';
export { default as LLM } from './LLMBackend.js';
export { default as Webhook } from './WebhookBackend.js';
export { default as Gemini } from './GeminiBackend.js';

/**
 * Backend registry for dynamic backend creation
 */
export const BackendTypes = {
    llm: 'LLMBackend',
    webhook: 'WebhookBackend',
    gemini: 'GeminiBackend'
};

/**
 * Backend factory function
 * @param {string} type - Backend type ('llm', 'webhook', or 'gemini')
 * @param {string} name - Backend instance name
 * @param {object} config - Backend configuration
 * @returns {Backend} Backend instance
 */
export function createBackend(type, name, config = {}) {
    switch (type.toLowerCase()) {
        case 'llm':
            const { LLMBackend } = await import('./LLMBackend.js');
            return new LLMBackend(name, config);
        case 'webhook':
            const { WebhookBackend } = await import('./WebhookBackend.js');
            return new WebhookBackend(name, config);
        case 'gemini':
            const { GeminiBackend } = await import('./GeminiBackend.js');
            return new GeminiBackend(name, config);
        default:
            throw new Error(`Unknown backend type: ${type}`);
    }
}

/**
 * Get all available backend types
 * @returns {string[]} Array of backend type names
 */
export function getAvailableBackendTypes() {
    return Object.keys(BackendTypes);
}
