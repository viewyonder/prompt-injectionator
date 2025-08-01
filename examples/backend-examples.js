import { LLMBackend, WebhookBackend, ChatBotBackend } from '../src/core/Backend.js';
import { Injectionator } from '../src/core/Injectionator.js';
import { SendChain, ReceiveChain } from '../src/core/Chain.js';
import { Mitigation } from '../src/core/Mitigation.js';
import { Injection } from '../src/core/Injection.js';

// Mock crypto.randomUUID for ES modules
global.crypto = {
    randomUUID: () => 'example-uuid-' + Date.now()
};

/**
 * Example 1: Using LLM Backend with Injectionator
 */
async function exampleLLMBackend() {
    console.log('=== Example 1: LLM Backend ===');
    
    // Create LLM backend with custom configuration
    const llmBackend = new LLMBackend('OpenAI GPT-4', {
        provider: 'openai',
        model: 'gpt-4',
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        maxTokens: 2000,
        temperature: 0.8
    });
    
    // Create basic chains (no mitigations for this example)
    const sendChain = new SendChain('LLM Send Chain', 'Pre-processes prompts for LLM');
    const receiveChain = new ReceiveChain('LLM Receive Chain', 'Post-processes LLM responses');
    
    // Create and configure injectionator
    const injectionator = new Injectionator(
        'LLM Injectionator',
        'Processes prompts through LLM backend',
        'https://github.com/example/llm-injectionator',
        sendChain,
        receiveChain,
        llmBackend
    );
    
    // Execute with user prompt
    const result = await injectionator.execute('Explain quantum computing in simple terms');
    
    console.log('Execution Result:', {
        success: result.success,
        finalResponse: result.finalResponse,
        backendType: result.steps[1]?.result?.metadata?.type,
        processingTime: result.steps[1]?.result?.metadata?.processingTime + 'ms'
    });
    
    return result;
}

/**
 * Example 2: Using Webhook Backend with Injectionator
 */
async function exampleWebhookBackend() {
    console.log('\\n=== Example 2: Webhook Backend ===');
    
    // Create webhook backend with custom configuration
    const webhookBackend = new WebhookBackend('n8n Workflow', {
        url: 'https://hooks.n8n.cloud/webhook/my-workflow',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer my-secret-token',
            'X-Custom-Header': 'injectionator-v1'
        },
        timeout: 10000
    });
    
    // Create chains with security mitigation
    const securityInjection = new Injection(
        'PII Detection',
        'privacy',
        'Detects personally identifiable information',
        ['email', 'phone', 'ssn', '@', 'credit card']
    );
    
    const securityMitigation = new Mitigation(
        'PII Blocker',
        'Active',
        'Blocks requests containing PII',
        [securityInjection]
    );
    
    const sendChain = new SendChain(
        'Webhook Send Chain',
        'Validates prompts before webhook call',
        'https://github.com/example/webhook-chain',
        null,
        [securityMitigation]
    );
    
    const receiveChain = new ReceiveChain('Webhook Receive Chain', 'Processes webhook responses');
    
    // Create injectionator
    const injectionator = new Injectionator(
        'Webhook Injectionator',
        'Processes prompts through webhook endpoints',
        'https://github.com/example/webhook-injectionator',
        sendChain,
        receiveChain,
        webhookBackend
    );
    
    // Execute with user prompt
    const result = await injectionator.execute('Process this data for analysis');
    
    console.log('Execution Result:', {
        success: result.success,
        finalResponse: result.finalResponse,
        webhookUrl: result.steps[1]?.result?.metadata?.webhookUrl,
        statusCode: result.steps[1]?.result?.metadata?.statusCode
    });
    
    return result;
}

/**
 * Example 3: Using ChatBot Backend with Injectionator
 */
async function exampleChatBotBackend() {
    console.log('\\n=== Example 3: ChatBot Backend ===');
    
    // Create chatbot backend with custom configuration
    const chatBotBackend = new ChatBotBackend('Customer Support Bot', {
        botId: 'support-bot-v2',
        apiUrl: 'https://api.chatservice.com/v1/chat',
        personality: 'professional',
        language: 'en-US',
        contextWindow: 8000
    });
    
    // Create chains with role-play detection
    const rolePlayInjection = new Injection(
        'Role Play Detection',
        'roleplay',
        'Detects attempts to make bot assume different roles',
        ['act as', 'pretend to be', 'simulate', 'roleplay', 'you are now']
    );
    
    const rolePlayMitigation = new Mitigation(
        'Role Play Blocker',
        'Active',
        'Prevents unauthorized role-playing',
        [rolePlayInjection]
    );
    
    const sendChain = new SendChain(
        'ChatBot Send Chain',
        'Validates user messages',
        'https://github.com/example/chatbot-chain',
        null,
        [rolePlayMitigation]
    );
    
    const receiveChain = new ReceiveChain('ChatBot Receive Chain', 'Processes bot responses');
    
    // Create injectionator
    const injectionator = new Injectionator(
        'ChatBot Injectionator',
        'Manages chatbot interactions with security',
        'https://github.com/example/chatbot-injectionator',
        sendChain,
        receiveChain,
        chatBotBackend
    );
    
    // Execute with user prompt
    const result = await injectionator.execute('Hello, I need help with my account settings');
    
    console.log('Execution Result:', {
        success: result.success,
        finalResponse: result.finalResponse,
        botId: result.steps[1]?.result?.metadata?.botId,
        personality: result.steps[1]?.result?.metadata?.personality,
        conversationId: result.steps[1]?.result?.metadata?.conversationId
    });
    
    return result;
}

/**
 * Example 4: Backend Configuration and Validation
 */
function exampleBackendValidation() {
    console.log('\\n=== Example 4: Backend Validation ===');
    
    // Create backends with invalid configurations
    const invalidWebhook = new WebhookBackend('Invalid Webhook', {
        url: 'not-a-valid-url',
        method: ''
    });
    
    const invalidChatBot = new ChatBotBackend('Invalid ChatBot', {
        botId: '',
        apiUrl: 'invalid-url'
    });
    
    console.log('Invalid Webhook Validation:', invalidWebhook.validate());
    console.log('Invalid ChatBot Validation:', invalidChatBot.validate());
    
    // Create valid configurations
    const validLLM = new LLMBackend();
    console.log('Valid LLM Validation:', validLLM.validate());
    console.log('Valid LLM Details:', validLLM.getDetails());
}

/**
 * Example 5: Switching Between Backends
 */
async function exampleBackendSwitching() {
    console.log('\\n=== Example 5: Backend Switching ===');
    
    // Create different backends
    const llmBackend = new LLMBackend('Primary LLM');
    const webhookBackend = new WebhookBackend('Fallback Webhook');
    const chatBotBackend = new ChatBotBackend('Emergency ChatBot');
    
    // Create a single injectionator
    const sendChain = new SendChain('Flexible Send Chain');
    const receiveChain = new ReceiveChain('Flexible Receive Chain');
    
    const injectionator = new Injectionator(
        'Multi-Backend Injectionator',
        'Can switch between different backends',
        'https://github.com/example/multi-backend'
    );
    
    injectionator.setSendChain(sendChain);
    injectionator.setReceiveChain(receiveChain);
    
    const testPrompt = 'What is the weather today?';
    
    // Test with LLM backend
    injectionator.setLLMBackend(llmBackend);
    const llmResult = await injectionator.execute(testPrompt);
    console.log('LLM Result:', llmResult.finalResponse);
    
    // Switch to webhook backend
    injectionator.setLLMBackend(webhookBackend);
    const webhookResult = await injectionator.execute(testPrompt);
    console.log('Webhook Result:', webhookResult.finalResponse);
    
    // Switch to chatbot backend
    injectionator.setLLMBackend(chatBotBackend);
    const chatBotResult = await injectionator.execute(testPrompt);
    console.log('ChatBot Result:', chatBotResult.finalResponse);
}

/**
 * Run all examples
 */
async function runAllExamples() {
    try {
        await exampleLLMBackend();
        await exampleWebhookBackend();
        await exampleChatBotBackend();
        exampleBackendValidation();
        await exampleBackendSwitching();
        
        console.log('\\n=== All Examples Completed Successfully! ===');
    } catch (error) {
        console.error('Error running examples:', error);
    }
}

// Export examples for testing or direct usage
export {
    exampleLLMBackend,
    exampleWebhookBackend,
    exampleChatBotBackend,
    exampleBackendValidation,
    exampleBackendSwitching,
    runAllExamples
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllExamples();
}
