#!/usr/bin/env node

// Fix crypto global for Node.js environment
import { webcrypto } from 'node:crypto';
if (!global.crypto) {
    global.crypto = webcrypto;
}

import { Injectionator } from '../src/core/Injectionator.js';
import { SendChain, ReceiveChain } from '../src/core/Chain.js';
import { Mitigation } from '../src/core/Mitigation.js';
import { Injection } from '../src/core/Injection.js';
import { LLMBackend } from '../src/backends/LLMBackend.js';
import { WebhookBackend } from '../src/backends/WebhookBackend.js';
// Note: ChatBotBackend doesn't exist as a separate file, using LLMBackend for demo
import logger, { Logger } from '../src/core/Logger.js';

console.log('🔍 Prompt Injectionator - Logging Demonstration\n');

async function demonstrateLogging() {
    // Create a main logger for the demo
    const mainLogger = new Logger({
        context: 'Demo',
        level: Logger.LOG_LEVELS.DEBUG
    });
    
    // Enable log collection to capture all logs
    mainLogger.enableCollection();
    
    // Listen to all log events
    const logEvents = [];
    mainLogger.on('log', (entry) => {
        logEvents.push(entry);
    });

    console.log('📋 Creating components with logging...\n');

    // Create injection patterns
    const sqlInjection = new Injection(
        'SQL Injection',
        'malicious',
        'Detects SQL injection patterns',
        ["'; DROP TABLE", "' OR '1'='1", "UNION SELECT"]
    );

    const xssInjection = new Injection(
        'XSS Attack',
        'malicious', 
        'Detects cross-site scripting patterns',
        ["<script>", "javascript:", "onclick="]
    );

    // Create mitigations with logging
    const securityMitigation = new Mitigation(
        'Security Filter',
        'Detects and blocks security threats',
        'https://github.com/example/security-rules',
        [sqlInjection, xssInjection],
        'On',
        'Active'
    );

    const monitoringMitigation = new Mitigation(
        'Security Monitor',
        'Monitors for security patterns in passive mode',
        'https://github.com/example/monitoring-rules',
        [sqlInjection],
        'On',
        'Passive'
    );

    // Create chains with logging
    const sendChain = new SendChain(
        'Security Send Chain',
        'Processes user prompts for security threats',
        'https://github.com/example/send-chain',
        null,
        [securityMitigation, monitoringMitigation]
    );

    const receiveChain = new ReceiveChain(
        'Security Receive Chain',
        'Processes LLM responses for security issues',
        'https://github.com/example/receive-chain',
        null,
        [monitoringMitigation]
    );

    // Create backend with logging
    const llmBackend = new LLMBackend('GPT-4 Mock', {
        provider: 'OpenAI',
        model: 'gpt-4',
        temperature: 0.7
    });

    // Create injectionator with logging
    const injectionator = new Injectionator(
        'Demo Security Guard',
        'Demonstration injectionator with comprehensive logging',
        'https://github.com/example/demo-guard',
        sendChain,
        receiveChain,
        llmBackend,
        mainLogger
    );

    console.log('🧪 Testing with clean prompt...\n');
    
    // Test with a clean prompt
    const cleanResult = await injectionator.execute("Hello, can you help me with my homework?");
    console.log(`✅ Clean prompt result: ${cleanResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`📝 Response: ${cleanResult.finalResponse}\n`);

    console.log('🧪 Testing with malicious prompt...\n');
    
    // Test with a malicious prompt
    const maliciousResult = await injectionator.execute("Hello'; DROP TABLE users; --");
    console.log(`⚠️  Malicious prompt result: ${maliciousResult.success ? 'SUCCESS' : 'BLOCKED'}`);
    console.log(`📝 Response: ${maliciousResult.finalResponse}\n`);

    console.log('🧪 Testing with different backend types...\n');
    
    // Test with webhook backend
    const webhookBackend = new WebhookBackend('N8N Webhook', {
        url: 'https://my-n8n.com/webhook/test',
        method: 'POST'
    });
    
    injectionator.setLLMBackend(webhookBackend);
    const webhookResult = await injectionator.execute("Test webhook integration");
    console.log(`🔗 Webhook result: ${webhookResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`📝 Response: ${webhookResult.finalResponse}\n`);

    // Test with another LLM backend (since ChatBotBackend doesn't exist as separate file)
    const chatbotBackend = new LLMBackend('Assistant Bot Style', {
        provider: 'mockup',
        model: 'mock-assistant',
        temperature: 0.8
    });
    
    injectionator.setLLMBackend(chatbotBackend);
    const chatbotResult = await injectionator.execute("How are you today?");
    console.log(`🤖 Chatbot result: ${chatbotResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`📝 Response: ${chatbotResult.finalResponse}\n`);

    // Display logging summary
    console.log('📊 LOGGING SUMMARY\n');
    console.log('==================\n');
    
    const logs = mainLogger.getLogs();
    const logCounts = {};
    const eventCounts = {};
    
    logs.forEach(log => {
        logCounts[log.level] = (logCounts[log.level] || 0) + 1;
        if (log.event) {
            eventCounts[log.event] = (eventCounts[log.event] || 0) + 1;
        }
    });
    
    console.log('📈 Log Level Distribution:');
    Object.entries(logCounts).forEach(([level, count]) => {
        console.log(`   ${level}: ${count} entries`);
    });
    
    console.log('\n🎯 Event Distribution:');
    Object.entries(eventCounts).forEach(([event, count]) => {
        console.log(`   ${event}: ${count} occurrences`);
    });
    
    console.log(`\n📝 Total log entries: ${logs.length}`);
    console.log(`⏱️  Session duration: ${logs[logs.length - 1]?.elapsed || 0}ms\n`);

    // Show detailed logs by setting log level to DEBUG
    console.log('🔍 DETAILED LOG TRACE (last 20 entries)\n');
    console.log('=======================================\n');
    
    logs.slice(-20).forEach((entry, index) => {
        const timestamp = new Date(entry.timestamp).toLocaleTimeString();
        const levelIcon = {
            'DEBUG': '🔍',
            'INFO': 'ℹ️',
            'WARN': '⚠️',
            'ERROR': '❌'
        }[entry.level] || '📝';
        
        console.log(`${levelIcon} [${timestamp}] [${entry.context}] ${entry.message}`);
        if (entry.event) {
            console.log(`   📋 Event: ${entry.event}`);
        }
        if (entry.processingTime) {
            console.log(`   ⏱️  Processing: ${entry.processingTime}ms`);
        }
        if (entry.error) {
            console.log(`   ❌ Error: ${entry.error}`);
        }
        console.log('');
    });

    console.log('✨ Logging demonstration completed!\n');
    console.log('🎓 Key Benefits:');
    console.log('   • Structured event-oriented logging');
    console.log('   • Configurable log levels (DEBUG, INFO, WARN, ERROR)');
    console.log('   • Automatic timing and performance metrics');
    console.log('   • Session tracking across components');
    console.log('   • Detailed error reporting and stack traces');
    console.log('   • Event emission for real-time monitoring');
    console.log('   • Child logger support for component isolation\n');
}

// Run the demonstration
demonstrateLogging().catch(console.error);
