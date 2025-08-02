import { Backend } from '../../src/backends/Backend.js';
import { LLMBackend } from '../../src/backends/LLMBackend.js';
import { WebhookBackend } from '../../src/backends/WebhookBackend.js';
import { GeminiBackend } from '../../src/backends/GeminiBackend.js';
import { Injectionator } from '../../src/core/Injectionator.js';
import { SendChain, ReceiveChain } from '../../src/core/Chain.js';

// Mock crypto.randomUUID for ES modules
global.crypto = {
    randomUUID: () => 'backend-test-uuid-' + Date.now()
};

describe('Backend Classes', () => {
    describe('LLMBackend', () => {
        test('should create LLM backend with default config', () => {
            const llmBackend = new LLMBackend();
            
            expect(llmBackend.name).toBe('LLM Backend');
            expect(llmBackend.type).toBe('llm');
            expect(llmBackend.config.provider).toBe('mockup');
            expect(llmBackend.config.model).toBe('mock-gpt-4');
        });

        test('should process user prompt and return mockup response', async () => {
            const llmBackend = new LLMBackend('Test LLM');
            const result = await llmBackend.process('Tell me about AI');
            
            expect(result.success).toBe(true);
            expect(result.response).toBe("I'm only a mockup, not a real boy");
            expect(result.metadata.backend).toBe('Test LLM');
            expect(result.metadata.type).toBe('llm');
            expect(result.metadata.prompt).toBe('Tell me about AI');
        });

        test('should validate configuration', () => {
            const llmBackend = new LLMBackend();
            const validation = llmBackend.validate();
            
            expect(validation.valid).toBe(true);
            expect(validation.issues).toHaveLength(0);
        });
    });

    describe('WebhookBackend', () => {
        test('should create webhook backend with default config', () => {
            const webhookBackend = new WebhookBackend();
            
            expect(webhookBackend.name).toBe('Webhook Backend');
            expect(webhookBackend.type).toBe('webhook');
            expect(webhookBackend.config.url).toBe('https://api.mockup.com/webhook');
            expect(webhookBackend.config.method).toBe('POST');
        });

        test('should process user prompt and return mockup response', async () => {
            const webhookBackend = new WebhookBackend('Test Webhook');
            const result = await webhookBackend.process('Process this data');
            
            expect(result.success).toBe(true);
            expect(result.response).toBe("I'm only a mockup, not a real boy");
            expect(result.metadata.backend).toBe('Test Webhook');
            expect(result.metadata.type).toBe('webhook');
            expect(result.metadata.statusCode).toBe(200);
        });

        test('should validate configuration', () => {
            const webhookBackend = new WebhookBackend();
            const validation = webhookBackend.validate();
            
            expect(validation.valid).toBe(true);
            expect(validation.issues).toHaveLength(0);
        });
    });

    describe('GeminiBackend', () => {
        test('should create Gemini backend with default config', () => {
            const geminiBackend = new GeminiBackend();
            
            expect(geminiBackend.name).toBe('Gemini Backend');
            expect(geminiBackend.type).toBe('gemini');
            expect(geminiBackend.config.provider).toBe('mockup');
            expect(geminiBackend.config.model).toBe('gemini-1.5-flash');
            expect(geminiBackend.config.maxTokens).toBe(1500);
            expect(geminiBackend.config.temperature).toBe(0.7);
        });

        test('should create Gemini backend with custom config', () => {
            const customConfig = {
                model: 'gemini-1.5-pro',
                maxTokens: 2000,
                temperature: 0.9,
                topP: 0.9,
                topK: 50
            };
            const geminiBackend = new GeminiBackend('Custom Gemini', customConfig);
            
            expect(geminiBackend.name).toBe('Custom Gemini');
            expect(geminiBackend.config.model).toBe('gemini-1.5-pro');
            expect(geminiBackend.config.maxTokens).toBe(2000);
            expect(geminiBackend.config.temperature).toBe(0.9);
            expect(geminiBackend.config.topP).toBe(0.9);
            expect(geminiBackend.config.topK).toBe(50);
        });

        test('should process user prompt and return mockup response', async () => {
            const geminiBackend = new GeminiBackend('Test Gemini');
            const result = await geminiBackend.process('Tell me about Gemini');
            
            expect(result.success).toBe(true);
            expect(result.response).toBe("I'm a Gemini mockup response, not connected to the real API");
            expect(result.metadata.backend).toBe('Test Gemini');
            expect(result.metadata.type).toBe('gemini');
            expect(result.metadata.provider).toBe('mockup');
            expect(result.metadata.model).toBe('gemini-1.5-flash');
            expect(result.metadata.mockup).toBe(true);
            expect(result.metadata.prompt).toBe('Tell me about Gemini');
        });

        test('should validate default configuration', () => {
            const geminiBackend = new GeminiBackend();
            const validation = geminiBackend.validate();
            
            expect(validation.valid).toBe(true);
            expect(validation.issues).toHaveLength(0);
        });

        test('should validate supported models', () => {
            const validModels = ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro', 'gemini-1.5-flash'];
            
            validModels.forEach(model => {
                const geminiBackend = new GeminiBackend('Test', { model });
                const validation = geminiBackend.validate();
                expect(validation.valid).toBe(true);
            });
        });

        test('should reject unsupported models', () => {
            const geminiBackend = new GeminiBackend('Test', { model: 'unsupported-model' });
            const validation = geminiBackend.validate();
            
            expect(validation.valid).toBe(false);
            expect(validation.issues).toContain(
                "Unsupported Gemini model 'unsupported-model'. Supported models: gemini-pro, gemini-pro-vision, gemini-1.5-pro, gemini-1.5-flash"
            );
        });

        test('should validate configuration parameters', () => {
            // Test invalid maxTokens (keeping mockup provider to avoid API key validation)
            let geminiBackend = new GeminiBackend('Test', { provider: 'mockup', maxTokens: 0 });
            let validation = geminiBackend.validate();
            expect(validation.valid).toBe(false);
            expect(validation.issues).toContain('maxTokens must be between 1 and 8192');

            // Test invalid temperature
            geminiBackend = new GeminiBackend('Test', { provider: 'mockup', temperature: 1.5 });
            validation = geminiBackend.validate();
            expect(validation.valid).toBe(false);
            expect(validation.issues).toContain('temperature must be between 0 and 1');

            // Test invalid topP
            geminiBackend = new GeminiBackend('Test', { provider: 'mockup', topP: -0.1 });
            validation = geminiBackend.validate();
            expect(validation.valid).toBe(false);
            expect(validation.issues).toContain('topP must be between 0 and 1');

            // Test invalid topK
            geminiBackend = new GeminiBackend('Test', { provider: 'mockup', topK: 101 });
            validation = geminiBackend.validate();
            expect(validation.valid).toBe(false);
            expect(validation.issues).toContain('topK must be between 1 and 100');
        });

        test('should require API key for non-mockup providers', () => {
            const geminiBackend = new GeminiBackend('Test', { 
                provider: 'google',
                apiKeyRef: null 
            });
            const validation = geminiBackend.validate();
            
            expect(validation.valid).toBe(false);
            expect(validation.issues).toContain('API key reference (apiKeyRef) is required for non-mockup providers');
        });

        test('should send real prompt to Gemini API and get valid response', async () => {
            // Skip this test if GEMINI_API_KEY is not set
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                console.log('Skipping real Gemini API test - GEMINI_API_KEY not set');
                return;
            }

            const geminiBackend = new GeminiBackend('Real Gemini Test', {
                provider: 'google',
                apiKeyRef: 'GEMINI_API_KEY',
                model: 'gemini-1.5-flash',
                maxTokens: 100,
                temperature: 0.7
            });

            const testPrompt = 'What color is the sky?';
            const result = await geminiBackend.process(testPrompt);

            // Validate response structure
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
            expect(result.success).toBe(true);
            expect(typeof result.response).toBe('string');
            expect(result.response.length).toBeGreaterThan(0);
            
            // Validate metadata structure
            expect(result.metadata).toBeDefined();
            expect(result.metadata.type).toBe('gemini');
            expect(result.metadata.provider).toBe('google');
            expect(result.metadata.model).toBe('gemini-1.5-flash');
            expect(result.metadata.backend).toBe('Real Gemini Test');
            expect(result.metadata.prompt).toBe(testPrompt);
            expect(typeof result.metadata.processingTime).toBe('number');
            expect(result.metadata.processingTime).toBeGreaterThan(0);
            
            // Validate token usage if available
            if (result.metadata.usage) {
                expect(typeof result.metadata.usage.promptTokens).toBe('number');
                expect(typeof result.metadata.usage.candidatesTokens).toBe('number');
                expect(typeof result.metadata.usage.totalTokens).toBe('number');
                expect(result.metadata.usage.totalTokens).toBeGreaterThan(0);
            }
        }, 30000); // 30 second timeout for API call
    });

});

describe('Injectionator with Backend Integration', () => {
    test('should execute with LLM backend', async () => {
        const llmBackend = new LLMBackend('Production LLM');
        const sendChain = new SendChain('Test Send Chain', 'Description', null, null, []);
        const receiveChain = new ReceiveChain('Test Receive Chain', 'Description', null, null, []);
        
        const injectionator = new Injectionator(
            'Test Injectionator',
            'Testing with LLM backend',
            null,
            sendChain,
            receiveChain,
            llmBackend
        );

        const result = await injectionator.execute('Tell me about machine learning');
        
        expect(result.success).toBe(true);
        expect(result.finalResponse).toBe("I'm only a mockup, not a real boy");
        expect(result.steps).toHaveLength(3); // send_chain, llm_backend, receive_chain
        expect(result.steps[1].step).toBe('llm_backend');
        expect(result.steps[1].backendName).toBe('Production LLM');
    });

    test('should execute with Webhook backend', async () => {
        const webhookBackend = new WebhookBackend('API Webhook', {
            url: 'https://my-api.com/process',
            method: 'POST'
        });
        const sendChain = new SendChain('Test Send Chain', 'Description', null, null, []);
        const receiveChain = new ReceiveChain('Test Receive Chain', 'Description', null, null, []);
        
        const injectionator = new Injectionator(
            'Webhook Injectionator',
            'Testing with webhook backend',
            null,
            sendChain,
            receiveChain,
            webhookBackend
        );

        const result = await injectionator.execute('Process this request');
        
        expect(result.success).toBe(true);
        expect(result.finalResponse).toBe("I'm only a mockup, not a real boy");
        expect(result.steps[1].result.metadata.webhookUrl).toBe('https://my-api.com/process');
    });

    test('should execute with Gemini backend', async () => {
        const geminiBackend = new GeminiBackend('Production Gemini', {
            model: 'gemini-1.5-pro',
            temperature: 0.8
        });
        const sendChain = new SendChain('Test Send Chain', 'Description', null, null, []);
        const receiveChain = new ReceiveChain('Test Receive Chain', 'Description', null, null, []);
        
        const injectionator = new Injectionator(
            'Gemini Injectionator',
            'Testing with Gemini backend',
            null,
            sendChain,
            receiveChain,
            geminiBackend
        );

        const result = await injectionator.execute('Test prompt injection vulnerabilities');
        
        expect(result.success).toBe(true);
        expect(result.finalResponse).toBe("I'm a Gemini mockup response, not connected to the real API");
        expect(result.steps).toHaveLength(3); // send_chain, gemini_backend, receive_chain
        expect(result.steps[1].step).toBe('llm_backend');
        expect(result.steps[1].backendName).toBe('Production Gemini');
        expect(result.steps[1].result.metadata.model).toBe('gemini-1.5-pro');
        expect(result.steps[1].result.metadata.mockup).toBe(true);
    });


    test('should handle backend errors gracefully', async () => {
        // Create a backend that will throw an error
        const errorBackend = new LLMBackend();
        errorBackend.process = async () => {
            throw new Error('Backend connection failed');
        };
        
        const sendChain = new SendChain('Test Send Chain', 'Description', null, null, []);
        const receiveChain = new ReceiveChain('Test Receive Chain', 'Description', null, null, []);
        
        const injectionator = new Injectionator(
            'Error Test Injectionator',
            'Testing error handling',
            null,
            sendChain,
            receiveChain,
            errorBackend
        );

        const result = await injectionator.execute('This will fail');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Backend connection failed');
        expect(result.finalResponse).toContain('Sorry, there was an error processing your request');
    });
});
