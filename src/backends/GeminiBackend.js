import { Backend } from './Backend.js';
import apiKeyManager from '../core/ApiKeyManager.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini Backend - integrates with Google's Gemini API for prompt injection testing
 */
export class GeminiBackend extends Backend {
    constructor(name = 'Gemini Backend', config = {}) {
        super(name, 'gemini', {
            provider: 'mockup',
            model: 'gemini-1.5-flash',
            apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
            maxTokens: 1500,
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            apiKeyRef: null, // Reference to API key, not the key itself
            ...config
        });
        
        this.initialize();
    }

    /**
     * Initializes the Gemini backend and resolves the API key
     */
    initialize() {
        // Resolve API key at runtime - try multiple approaches
        this.apiKey = null;
        if (this.config.apiKeyRef && this.apiKeyManager) {
            // Try API key manager first
            try {
                this.apiKey = this.apiKeyManager.resolveKey(this.config.apiKeyRef);
            } catch (error) {
                // Fallback to direct environment variable access
                this.apiKey = process.env[this.config.apiKeyRef];
            }
        } else if (this.config.apiKey) {
            // Direct API key provided
            this.apiKey = this.config.apiKey;
        } else {
            // Try default environment variable
            this.apiKey = process.env.GEMINI_API_KEY;
        }
        
        // Initialize Gemini client if API key is available
        this.geminiClient = null;
        if (this.apiKey) {
            try {
                this.geminiClient = new GoogleGenerativeAI(this.apiKey);
            } catch (error) {
                this.logger.warn('Failed to initialize Gemini client', {
                    event: 'gemini_client_init_error',
                    error: error.message
                });
            }
        }
    }

    /**
     * Set the API key manager
     * @param {ApiKeyManager} apiKeyManager - The API key manager
     */
    setApiKeyManager(apiKeyManager) {
        this.apiKeyManager = apiKeyManager;
        this.initialize();  // Re-initialize to resolve API key with manager
    }

    /**
     * Process user prompt through Gemini API
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} Gemini response result
     */
    async process(userPrompt) {
        try {
            const startTime = Date.now();
            this.logger.info('Processing user prompt', {
                event: 'gemini_process_start',
                promptLength: userPrompt.length,
                model: this.config.model
            });

            // Handle mockup mode for testing
            if (this.config.provider === 'mockup' || !this.apiKey || !this.geminiClient) {
                this.logger.info('Running in mockup mode', {
                    event: 'gemini_mockup_mode',
                    reason: !this.apiKey ? 'no_api_key' : 'mockup_provider'
                });
                
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 250));
                
                const processingTime = Date.now() - startTime;
                
                return {
                    success: true,
                    response: "I'm a Gemini mockup response, not connected to the real API",
                    metadata: {
                        backend: this.name,
                        type: this.type,
                        provider: this.config.provider,
                        model: this.config.model,
                        tokens: userPrompt.length,
                        processingTime: processingTime,
                        prompt: userPrompt,
                        mockup: true
                    }
                };
            }

            // Real API call
            const model = this.geminiClient.getGenerativeModel({ 
                model: this.config.model,
                generationConfig: {
                    maxOutputTokens: this.config.maxTokens,
                    temperature: this.config.temperature,
                    topP: this.config.topP,
                    topK: this.config.topK
                }
            });

            this.logger.debug('Calling Gemini API', {
                event: 'gemini_api_call',
                model: this.config.model,
                maxTokens: this.config.maxTokens
            });

            const result = await model.generateContent(userPrompt);
            const response = await result.response;
            const text = response.text();
            
            const processingTime = Date.now() - startTime;
            
            // Extract usage metadata if available
            const usageMetadata = response.usageMetadata || {};
            
            const successResult = {
                success: true,
                response: text,
                metadata: {
                    backend: this.name,
                    type: this.type,
                    provider: this.config.provider,
                    model: this.config.model,
                    tokens: usageMetadata.totalTokenCount || userPrompt.length,
                    promptTokens: usageMetadata.promptTokenCount,
                    completionTokens: usageMetadata.candidatesTokenCount,
                    processingTime: processingTime,
                    prompt: userPrompt,
                    temperature: this.config.temperature,
                    topP: this.config.topP,
                    topK: this.config.topK
                }
            };
            
            this.logger.info('Processing completed', {
                event: 'gemini_process_end',
                processingTime: processingTime,
                responseLength: text.length,
                totalTokens: usageMetadata.totalTokenCount
            });

            return successResult;
            
        } catch (error) {
            const processingTime = Date.now() - Date.now();
            
            this.logger.error('Processing failed', {
                event: 'gemini_process_error',
                error: error.message,
                errorCode: error.code,
                processingTime: processingTime
            });
            
            // Handle specific Gemini API errors
            let errorMessage = error.message;
            if (error.message.includes('API_KEY_INVALID')) {
                errorMessage = 'Invalid Gemini API key. Please check your API key configuration.';
            } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
                errorMessage = 'Gemini API rate limit exceeded. Please try again later.';
            } else if (error.message.includes('QUOTA_EXCEEDED')) {
                errorMessage = 'Gemini API quota exceeded. Please check your billing settings.';
            } else if (error.message.includes('MODEL_NOT_FOUND')) {
                errorMessage = `Gemini model '${this.config.model}' not found. Please check your model configuration.`;
            }
            
            return {
                success: false,
                error: errorMessage,
                metadata: {
                    backend: this.name,
                    type: this.type,
                    provider: this.config.provider,
                    model: this.config.model,
                    originalError: error.message,
                    errorCode: error.code,
                    processingTime: processingTime
                }
            };
        }
    }

    /**
     * Validate Gemini backend configuration
     * @returns {object} Validation result
     */
    validate() {
        const issues = [];
        
        if (!this.config.provider) {
            issues.push('Gemini provider is required');
        }
        
        if (!this.config.model) {
            issues.push('Gemini model is required');
        }
        
        // Validate supported models
        const supportedModels = [
            'gemini-pro',
            'gemini-pro-vision',
            'gemini-1.5-pro',
            'gemini-1.5-flash'
        ];
        
        if (this.config.model && !supportedModels.includes(this.config.model)) {
            issues.push(`Unsupported Gemini model '${this.config.model}'. Supported models: ${supportedModels.join(', ')}`);
        }
        
        // Check if API key reference is provided and can be resolved
        if (this.config.apiKeyRef) {
            if (!this.apiKey) {
                issues.push(`API key '${this.config.apiKeyRef}' could not be resolved. Check environment variables or CLI arguments.`);
            }
        } else if (this.config.provider !== 'mockup') {
            issues.push('API key reference (apiKeyRef) is required for non-mockup providers');
        }
        
        // Validate configuration parameters
        if (this.config.maxTokens !== undefined && (this.config.maxTokens < 1 || this.config.maxTokens > 8192)) {
            issues.push('maxTokens must be between 1 and 8192');
        }
        
        if (this.config.temperature !== undefined && (this.config.temperature < 0 || this.config.temperature > 1)) {
            issues.push('temperature must be between 0 and 1');
        }
        
        if (this.config.topP !== undefined && (this.config.topP < 0 || this.config.topP > 1)) {
            issues.push('topP must be between 0 and 1');
        }
        
        if (this.config.topK !== undefined && (this.config.topK < 1 || this.config.topK > 100)) {
            issues.push('topK must be between 1 and 100');
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

export default GeminiBackend;
