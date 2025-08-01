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
}

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
            ...config
        });
    }

    /**
     * Process user prompt through LLM
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} LLM response result
     */
    async process(userPrompt) {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 200));

            return {
                success: true,
                response: "I'm only a mockup, not a real boy",
                metadata: {
                    backend: this.name,
                    type: this.type,
                    provider: this.config.provider,
                    model: this.config.model,
                    tokens: userPrompt.length,
                    processingTime: 200,
                    prompt: userPrompt
                }
            };
        } catch (error) {
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

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

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
            // Simulate webhook call delay
            await new Promise(resolve => setTimeout(resolve, 150));

            return {
                success: true,
                response: "I'm only a mockup, not a real boy",
                metadata: {
                    backend: this.name,
                    type: this.type,
                    webhookUrl: this.config.url,
                    method: this.config.method,
                    processingTime: 150,
                    prompt: userPrompt,
                    statusCode: 200
                }
            };
        } catch (error) {
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

/**
 * ChatBot Backend mockup - simulates a chatbot service
 */
export class ChatBotBackend extends Backend {
    constructor(name = 'ChatBot Backend', config = {}) {
        super(name, 'chatbot', {
            botId: 'mock-bot-123',
            apiUrl: 'https://api.mockup.com/chatbot',
            personality: 'helpful',
            language: 'en',
            contextWindow: 4000,
            ...config
        });
    }

    /**
     * Process user prompt through chatbot
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} ChatBot response result
     */
    async process(userPrompt) {
        try {
            // Simulate chatbot processing delay
            await new Promise(resolve => setTimeout(resolve, 300));

            return {
                success: true,
                response: "I'm only a mockup, not a real boy",
                metadata: {
                    backend: this.name,
                    type: this.type,
                    botId: this.config.botId,
                    personality: this.config.personality,
                    language: this.config.language,
                    processingTime: 300,
                    prompt: userPrompt,
                    conversationId: 'conv-' + Date.now()
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                metadata: {
                    backend: this.name,
                    type: this.type,
                    botId: this.config.botId
                }
            };
        }
    }

    /**
     * Validate chatbot backend configuration
     * @returns {object} Validation result
     */
    validate() {
        const issues = [];
        
        if (!this.config.botId) {
            issues.push('Bot ID is required');
        }
        
        if (!this.config.apiUrl) {
            issues.push('ChatBot API URL is required');
        }

        // Basic URL validation
        if (this.config.apiUrl && !this.config.apiUrl.startsWith('http')) {
            issues.push('ChatBot API URL must be a valid HTTP/HTTPS URL');
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// Export default for backward compatibility
export default Backend;
