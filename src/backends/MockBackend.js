import { Backend } from './Backend.js';

/**
 * Mock Backend - replays user input for testing
 */
export class MockBackend extends Backend {
    constructor(name = 'Mock Backend', config = {}) {
        super(name, 'mock', {
            provider: 'mockup',
            responsePrefix: 'Mock response: ',
            ...config
        });
    }

    /**
     * Process user prompt by echoing it back
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} Mock response result
     */
    async process(userPrompt) {
        try {
            const startTime = Date.now();
            
            this.logger.info('Processing user prompt in mock mode', {
                event: 'mock_process_start',
                promptLength: userPrompt.length
            });
            
            // Simulate some processing time
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const processingTime = Date.now() - startTime;
            const response = `${this.config.responsePrefix}${userPrompt}`;
            
            const result = {
                success: true,
                response: response,
                metadata: {
                    backend: this.name,
                    type: this.type,
                    provider: this.config.provider,
                    tokens: userPrompt.length,
                    processingTime: processingTime,
                    prompt: userPrompt,
                    mockup: true
                }
            };
            
            this.logger.info('Mock processing completed', {
                event: 'mock_process_end',
                processingTime: processingTime,
                responseLength: response.length
            });
            
            return result;
            
        } catch (error) {
            this.logger.error('Mock processing failed', {
                event: 'mock_process_error',
                error: error.message
            });
            
            return {
                success: false,
                error: error.message,
                metadata: {
                    backend: this.name,
                    type: this.type,
                    provider: this.config.provider,
                    originalError: error.message
                }
            };
        }
    }

    /**
     * Validate mock backend configuration
     * @returns {object} Validation result
     */
    validate() {
        return {
            valid: true,
            issues: [],
            warnings: []
        };
    }
}

export default MockBackend;
