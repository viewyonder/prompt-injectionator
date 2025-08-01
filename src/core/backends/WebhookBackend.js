import { Backend } from './Backend.js';

/**
 * Webhook Backend mockup - simulates calling a webhook endpoint
 */
export class WebhookBackend extends Backend {
    constructor(name = 'Webhook Backend', config = {}) {
        super(name, 'webhook', {
            url: 'https://api.mockup.com/webhook',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer mock-token'
            },
            timeout: 5000,
            ...config
        });
    }

    /**
     * Process user prompt through webhook
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} Webhook response result
     */
    async process(userPrompt) {
        try {
            const startTime = Date.now();
            this.logger.info('Processing user prompt', {
                event: 'webhook_process_start',
                promptLength: userPrompt.length
            });
            
            // Simulate webhook call delay
            await new Promise(resolve => setTimeout(resolve, 150));

            const processingTime = Date.now() - startTime;
            
            const result = {
                success: true,
                response: "I'm only a mockup, not a real boy",
                metadata: {
                    backend: this.name,
                    type: this.type,
                    webhookUrl: this.config.url,
                    method: this.config.method,
                    processingTime: processingTime,
                    prompt: userPrompt,
                    statusCode: 200
                }
            };
            
            this.logger.info('Processing completed', {
                event: 'webhook_process_end',
                processingTime: processingTime
            });

            return result;
        } catch (error) {
            this.logger.error('Processing failed', {
                event: 'webhook_process_error',
                error: error.message
            });
            return {
                success: false,
                error: error.message,
                metadata: {
                    backend: this.name,
                    type: this.type,
                    webhookUrl: this.config.url
                }
            };
        }
    }

    /**
     * Validate webhook backend configuration
     * @returns {object} Validation result
     */
    validate() {
        const issues = [];
        
        if (!this.config.url) {
            issues.push('Webhook URL is required');
        }
        
        if (!this.config.method) {
            issues.push('HTTP method is required');
        }

        // Basic URL validation
        if (this.config.url && !this.config.url.startsWith('http')) {
            issues.push('Webhook URL must be a valid HTTP/HTTPS URL');
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

export default WebhookBackend;
