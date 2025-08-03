import logger from './Logger.js';

/**
 * Secure API Key Manager
 * Handles API key resolution from environment variables and command-line arguments
 * Never stores API keys in configuration files
 */
export class ApiKeyManager {
    constructor() {
        this.logger = logger.withContext('ApiKeyManager');
        this.runtimeKeys = new Map(); // For keys provided via CLI
    }

    /**
     * Add an API key for runtime use (from command line)
     * @param {string} keyName - The reference name for the API key
     * @param {string} keyValue - The actual API key value
     */
    addRuntimeKey(keyName, keyValue) {
        if (!keyName || !keyValue) {
            throw new Error('Both keyName and keyValue are required');
        }
        
        this.runtimeKeys.set(keyName, keyValue);
        this.logger.info('Runtime API key registered', { 
            keyName,
            event: 'api_key_registered'
        });
    }

    /**
     * Check if a runtime key exists
     * @param {string} keyRef - The API key reference name
     * @returns {boolean} True if the key exists in runtime storage
     */
    hasRuntimeKey(keyRef) {
        return this.runtimeKeys.has(keyRef);
    }

    /**
     * Resolve an API key by reference name
     * Priority: 1. Runtime keys (CLI) 2. Environment variables
     * @param {string} keyRef - The API key reference name
     * @returns {string|null} The resolved API key or null if not found
     */
    resolveKey(keyRef) {
        if (!keyRef) {
            this.logger.warn('Empty API key reference provided');
            return null;
        }

        // Priority 1: Check runtime keys (from CLI)
        if (this.runtimeKeys.has(keyRef)) {
            this.logger.debug('API key resolved from runtime', { 
                keyRef,
                source: 'runtime',
                event: 'api_key_resolved'
            });
            return this.runtimeKeys.get(keyRef);
        }

        // Priority 2: Check environment variables
        const envValue = process.env[keyRef];
        if (envValue) {
            this.logger.debug('API key resolved from environment', { 
                keyRef,
                source: 'environment',
                event: 'api_key_resolved'
            });
            return envValue;
        }

        this.logger.warn('API key not found', { 
            keyRef,
            event: 'api_key_not_found'
        });
        return null;
    }

    /**
     * Validate that all required API keys are available
     * @param {Array<string>} requiredKeys - List of required API key references
     * @returns {object} Validation result with missing keys
     */
    validateKeys(requiredKeys) {
        const missing = [];
        const available = [];

        for (const keyRef of requiredKeys) {
            if (this.resolveKey(keyRef)) {
                available.push(keyRef);
            } else {
                missing.push(keyRef);
            }
        }

        const isValid = missing.length === 0;
        
        this.logger.info('API key validation completed', {
            total: requiredKeys.length,
            available: available.length,
            missing: missing.length,
            missingKeys: missing,
            valid: isValid,
            event: 'api_key_validation'
        });

        return {
            valid: isValid,
            available,
            missing,
            message: isValid 
                ? 'All required API keys are available'
                : `Missing API keys: ${missing.join(', ')}`
        };
    }

    /**
     * Get usage instructions for providing API keys
     * @param {Array<string>} requiredKeys - List of required API key references
     * @returns {string} Usage instructions
     */
    getUsageInstructions(requiredKeys) {
        const instructions = [
            '\n📋 API Key Configuration Options:',
            '',
            '1. Environment Variables (recommended for development):',
            ...requiredKeys.map(key => `   export ${key}="your_actual_api_key"`),
            '',
            '2. Command Line Arguments:',
            ...requiredKeys.map(key => `   --api-key ${key}=your_actual_api_key`),
            '',
            '3. Multiple keys example:',
            `   --api-key ${requiredKeys[0] || 'OPENAI_API_KEY'}=sk-xxx --api-key ANTHROPIC_API_KEY=sk-yyy`,
            '',
            '⚠️  Security Notes:',
            '• Never commit API keys to version control',
            '• Use environment variables for production',
            '• Command line args are visible in process lists',
            ''
        ];
        
        return instructions.join('\n');
    }

    /**
     * Parse API key arguments from command line
     * Expected format: --api-key KEY_NAME=key_value
     * @param {Array<string>} args - Command line arguments
     * @returns {number} Number of keys parsed
     */
    parseCliArguments(args) {
        let keyCount = 0;
        
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--api-key' && i + 1 < args.length) {
                const keyPair = args[i + 1];
                const [keyName, ...keyValueParts] = keyPair.split('=');
                const keyValue = keyValueParts.join('='); // Handle = in API keys
                
                if (keyName && keyValue) {
                    this.addRuntimeKey(keyName, keyValue);
                    keyCount++;
                } else {
                    this.logger.warn('Invalid API key format', { 
                        argument: keyPair,
                        expectedFormat: 'KEY_NAME=key_value',
                        event: 'invalid_api_key_format'
                    });
                }
                i++; // Skip the next argument since we processed it
            }
        }

        if (keyCount > 0) {
            this.logger.info('CLI API keys parsed', { 
                count: keyCount,
                event: 'cli_keys_parsed'
            });
        }

        return keyCount;
    }

    /**
     * Clear all runtime keys (for security)
     */
    clearRuntimeKeys() {
        const count = this.runtimeKeys.size;
        this.runtimeKeys.clear();
        this.logger.info('Runtime keys cleared', { 
            count,
            event: 'runtime_keys_cleared'
        });
    }

    /**
     * Get statistics about available keys (without exposing values)
     * @returns {object} Key statistics
     */
    getKeyStats() {
        const runtimeCount = this.runtimeKeys.size;
        const envKeys = Object.keys(process.env).filter(key => 
            key.includes('API_KEY') || key.includes('TOKEN')
        );
        
        return {
            runtimeKeys: runtimeCount,
            environmentKeys: envKeys.length,
            totalSources: 2
        };
    }
}

// Singleton instance
const apiKeyManager = new ApiKeyManager();
export default apiKeyManager;
