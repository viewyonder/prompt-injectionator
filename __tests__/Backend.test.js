import { Backend, LLMBackend, WebhookBackend, ChatBotBackend } from '../src/core/Backend.js';
import { Injectionator } from '../src/core/Injectionator.js';
import { SendChain, ReceiveChain } from '../src/core/Chain.js';

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

    describe('ChatBotBackend', () => {
        test('should create chatbot backend with default config', () => {
            const chatBotBackend = new ChatBotBackend();
            
            expect(chatBotBackend.name).toBe('ChatBot Backend');
            expect(chatBotBackend.type).toBe('chatbot');
            expect(chatBotBackend.config.botId).toBe('mock-bot-123');
            expect(chatBotBackend.config.personality).toBe('helpful');
        });

        test('should process user prompt and return mockup response', async () => {
            const chatBotBackend = new ChatBotBackend('Test ChatBot');
            const result = await chatBotBackend.process('Hello, how are you?');
            
            expect(result.success).toBe(true);
            expect(result.response).toBe("I'm only a mockup, not a real boy");
            expect(result.metadata.backend).toBe('Test ChatBot');
            expect(result.metadata.type).toBe('chatbot');
            expect(result.metadata.conversationId).toMatch(/^conv-/);
        });

        test('should validate configuration', () => {
            const chatBotBackend = new ChatBotBackend();
            const validation = chatBotBackend.validate();
            
            expect(validation.valid).toBe(true);
            expect(validation.issues).toHaveLength(0);
        });
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

    test('should execute with ChatBot backend', async () => {
        const chatBotBackend = new ChatBotBackend('Support Bot', {
            botId: 'support-bot-456',
            personality: 'friendly'
        });
        const sendChain = new SendChain('Test Send Chain', 'Description', null, null, []);
        const receiveChain = new ReceiveChain('Test Receive Chain', 'Description', null, null, []);
        
        const injectionator = new Injectionator(
            'ChatBot Injectionator',
            'Testing with chatbot backend',
            null,
            sendChain,
            receiveChain,
            chatBotBackend
        );

        const result = await injectionator.execute('I need help with my account');
        
        expect(result.success).toBe(true);
        expect(result.finalResponse).toBe("I'm only a mockup, not a real boy");
        expect(result.steps[1].result.metadata.botId).toBe('support-bot-456');
        expect(result.steps[1].result.metadata.personality).toBe('friendly');
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
