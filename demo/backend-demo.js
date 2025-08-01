#!/usr/bin/env node

import { LLMBackend, WebhookBackend, ChatBotBackend } from '../src/core/Backend.js';
import { Injectionator } from '../src/core/Injectionator.js';
import { SendChain, ReceiveChain } from '../src/core/Chain.js';
import { randomUUID } from 'crypto';

// Provide crypto.randomUUID for the classes
if (!global.crypto) {
    global.crypto = { randomUUID };
}

console.log('🚀 Prompt Injectionator Backend Demo\n');
console.log('='.repeat(50));

/**
 * Demo function to showcase each backend type
 */
async function demonstrateBackend(backendName, backend, prompt) {
    console.log(`\n🔧 Testing ${backendName} Backend`);
    console.log('-'.repeat(30));
    
    // Create basic chains (no mitigations for simplicity)
    const sendChain = new SendChain(`${backendName} Send Chain`, `Pre-processes prompts for ${backendName}`);
    const receiveChain = new ReceiveChain(`${backendName} Receive Chain`, `Post-processes ${backendName} responses`);
    
    // Create injectionator
    const injectionator = new Injectionator(
        `${backendName} Injectionator`,
        `Processes prompts through ${backendName} backend`,
        null,
        sendChain,
        receiveChain,
        backend
    );
    
    console.log(`📤 Prompt: "${prompt}"`);
    
    try {
        const result = await injectionator.execute(prompt);
        
        console.log(`✅ Success: ${result.success}`);
        console.log(`💬 Response: "${result.finalResponse}"`);
        console.log(`⏱️  Processing Time: ${result.steps[1]?.result?.metadata?.processingTime}ms`);
        console.log(`🏷️  Backend Type: ${result.steps[1]?.result?.metadata?.type}`);
        
        if (result.steps[1]?.result?.metadata?.webhookUrl) {
            console.log(`🔗 Webhook URL: ${result.steps[1].result.metadata.webhookUrl}`);
        }
        
        if (result.steps[1]?.result?.metadata?.botId) {
            console.log(`🤖 Bot ID: ${result.steps[1].result.metadata.botId}`);
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

/**
 * Main demo function
 */
async function runDemo() {
    const testPrompt = 'Hello! Can you help me understand how AI works?';
    
    try {
        // Demo 1: LLM Backend
        const llmBackend = new LLMBackend('Demo LLM', {
            provider: 'openai',
            model: 'gpt-4-turbo',
            temperature: 0.7
        });
        await demonstrateBackend('LLM', llmBackend, testPrompt);
        
        // Demo 2: Webhook Backend
        const webhookBackend = new WebhookBackend('Demo Webhook', {
            url: 'https://api.example.com/process',
            method: 'POST',
            timeout: 3000
        });
        await demonstrateBackend('Webhook', webhookBackend, testPrompt);
        
        // Demo 3: ChatBot Backend
        const chatBotBackend = new ChatBotBackend('Demo ChatBot', {
            botId: 'demo-assistant-v1',
            personality: 'helpful',
            language: 'en'
        });
        await demonstrateBackend('ChatBot', chatBotBackend, testPrompt);
        
        // Demo 4: Backend validation
        console.log('\n🔍 Backend Validation Demo');
        console.log('-'.repeat(30));
        
        const backends = [
            { name: 'LLM', backend: llmBackend },
            { name: 'Webhook', backend: webhookBackend },
            { name: 'ChatBot', backend: chatBotBackend }
        ];
        
        backends.forEach(({ name, backend }) => {
            const validation = backend.validate();
            console.log(`${name} Backend - Valid: ${validation.valid}, Issues: ${validation.issues.length}`);
        });
        
        // Demo 5: Backend switching
        console.log('\n🔄 Backend Switching Demo');
        console.log('-'.repeat(30));
        
        const flexibleInjectionator = new Injectionator(
            'Flexible Injectionator',
            'Can switch between different backends'
        );
        
        flexibleInjectionator.setSendChain(new SendChain('Flexible Send Chain'));
        flexibleInjectionator.setReceiveChain(new ReceiveChain('Flexible Receive Chain'));
        
        const switchPrompt = 'Quick test message';
        
        for (const { name, backend } of backends) {
            flexibleInjectionator.setLLMBackend(backend);
            const result = await flexibleInjectionator.execute(switchPrompt);
            console.log(`${name}: "${result.finalResponse}"`);
        }
        
        console.log('\n✨ Demo completed successfully!');
        console.log('\n📝 Summary:');
        console.log('- Created LLM, Webhook, and ChatBot backend mockups');
        console.log('- All backends return: "I\'m only a mockup, not a real boy"');
        console.log('- Backends can be easily swapped in/out of Injectionators');
        console.log('- Each backend has unique configuration and metadata');
        console.log('- Validation ensures proper backend configuration');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        process.exit(1);
    }
}

// Run the demo
runDemo();
