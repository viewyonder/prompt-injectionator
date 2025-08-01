import { Backend } from './Backend.js';
import apiKeyManager from '../ApiKeyManager.js';

/**
 * LLM Backend mockup - simulates calling a Large Language Model API
 */
export class LLMBackend extends Backend {
    constructor(name = 'LLM Backend', config = {}) {
        super(name, 'llm', {
            provider: 'mockup',
            model: 'mock-gpt-4',
            apiUrl: 'https://api.mockup.com/v1/chat/completions',
            maxTokens: 1000,
            temperature: 0.7,
            apiKeyRef: null, // Reference to API key, not the key itself
            ...config
        });
        
        // Resolve API key at runtime if reference is provided
        this.apiKey = config.apiKeyRef ? apiKeyManager.resolveKey(config.apiKeyRef) : null;
    }

    /**
     * Process user prompt through LLM
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} LLM response result
     */
    async process(userPrompt) {
        try {
            const startTime = Date.now();
            this.logger.info('Processing user prompt', {
                event: 'llm_process_start',
                promptLength: userPrompt.length
            });
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 200));

            const processingTime = Date.now() - startTime;
            
            const result = {
                success: true,
                response: "I'm only a mockup, not a real boy",
                metadata: {
                    backend: this.name,
                    type: this.type,
                    provider: this.config.provider,
                    model: this.config.model,
                    tokens: userPrompt.length,
                    processingTime: processingTime,
                    prompt: userPrompt
                }
            };
            
            this.logger.info('Processing completed', {
                event: 'llm_process_end',
                processingTime: processingTime
            });

            return result;
        } catch (error) {
            this.logger.error('Processing failed', {
                event: 'llm_process_error',
                error: error.message
            });
            return {
                success: false,
                error: error.message,
                metadata: {
                    backend: this.name,
                    type: this.type
                }
            };
        }
    }

    /**
     * Validate LLM backend configuration
     * @returns {object} Validation result
     */
    validate() {
        const issues = [];
        
        if (!this.config.provider) {
            issues.push('LLM provider is required');
        }
        
        if (!this.config.model) {
            issues.push('LLM model is required');
        }
        
        // Check if API key reference is provided and can be resolved
        if (this.config.apiKeyRef) {
            if (!this.apiKey) {
                issues.push(`API key '${this.config.apiKeyRef}' could not be resolved. Check environment variables or CLI arguments.`);
            }
        } else if (this.config.provider !== 'mockup') {
            issues.push('API key reference (apiKeyRef) is required for non-mockup providers');
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

export default LLMBackend;
