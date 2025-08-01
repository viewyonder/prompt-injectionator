import { LLMBackend } from '../src/backends/LLMBackend.js';
import { WebhookBackend } from '../src/backends/WebhookBackend.js';
import { Backend } from '../src/backends/Backend.js';
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
 * Example 3: Using Mock Backend with Injectionator
 */
async function exampleMockBackend() {
    console.log('\\n=== Example 3: Mock Backend ===');
    
    // Create mock backend with custom configuration
    const mockBackend = new LLMBackend('Mock Backend', {
        provider: 'mockup',
        model: 'mock-model',
        responseTemplate: 'Mock response: {{prompt}}'
    });
    
    // Create chains with role-play detection
    const rolePlayInjection = new Injection(
        'role-play',
        'Role Play',
        'Detects attempts to make bot assume different roles',
        ['act as', 'pretend to be', 'simulate', 'roleplay', 'you are now']
    );
    
    const rolePlayMitigation = new Mitigation(
        'Role Play Blocker',
        'Blocks unauthorized role-playing attempts',
        null,
        [rolePlayInjection],
        'On',
        'Active'
    );
    
    const sendChain = new SendChain(
        'Mock Send Chain',
        'Validates user messages',
        'https://github.com/example/mock-chain',
        null,
        [rolePlayMitigation]
    );
    
    const receiveChain = new ReceiveChain('Mock Receive Chain', 'Processes mock responses');
    
    // Create injectionator
    const injectionator = new Injectionator(
        'Mock Injectionator',
        'Manages mock interactions with security',
        'https://github.com/example/mock-injectionator',
        sendChain,
        receiveChain,
        mockBackend
    );
    
    // Execute with user prompt
    const result = await injectionator.execute('Hello, I need help with my account settings');
    
    console.log('Execution Result:', {
        success: result.success,
        finalResponse: result.finalResponse,
        provider: result.steps[1]?.result?.metadata?.provider,
        model: result.steps[1]?.result?.metadata?.model,
        processingTime: result.steps[1]?.result?.metadata?.processingTime + 'ms'
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
    
    
    console.log('Invalid Webhook Validation:', invalidWebhook.validate());
    
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
    const webhookBackend = new WebhookBackend('Fallback Webhook', {
        url: 'https://api.example.com/webhook',
        method: 'POST'
    });
    const mockBackend = new LLMBackend('Mock Backend', {
        provider: 'mockup',
        model: 'mock-model'
    });
    
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
    
    // Switch to mock backend
    injectionator.setLLMBackend(mockBackend);
    const mockResult = await injectionator.execute(testPrompt);
    console.log('Mock Result:', mockResult.finalResponse);
}

/**
 * Run all examples
 */
async function runAllExamples() {
    try {
        await exampleLLMBackend();
        await exampleWebhookBackend();
        await exampleMockBackend();
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
    exampleMockBackend,
    exampleBackendValidation,
    exampleBackendSwitching,
    runAllExamples
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllExamples();
}
