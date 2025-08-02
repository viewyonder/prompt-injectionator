#!/usr/bin/env node

import { GeminiBackend } from '../src/backends/GeminiBackend.js';

async function testCrawdadsPoem() {
    console.log('🦞 Testing Gemini with crawdads poem request...\n');
    
    // Create GeminiBackend with real Google provider
    const geminiBackend = new GeminiBackend('Poetry Gemini', {
        provider: 'google',
        apiKeyRef: 'GEMINI_API_KEY',
        model: 'gemini-1.5-flash',
        maxTokens: 500,  // Allow more tokens for a poem
        temperature: 0.7  // A bit more creative
    });
    
    console.log('🚀 Sending prompt to Gemini...');
    console.log('📝 Prompt: "Write me a poem about crawdads"\n');
    
    try {
        const result = await geminiBackend.process('Write me a poem about crawdads');
        
        if (result.success) {
            console.log('✅ Gemini responded successfully!\n');
            console.log('🎭 === GEMINI\'S CRAWDADS POEM ===');
            console.log(result.response);
            console.log('='.repeat(40));
            console.log(`\n📊 Metadata:`);
            console.log(`   ⏱️  Processing time: ${result.metadata.processingTime}ms`);
            console.log(`   🧮 Total tokens: ${result.metadata.tokens}`);
            console.log(`   📥 Prompt tokens: ${result.metadata.promptTokens}`);
            console.log(`   📤 Response tokens: ${result.metadata.completionTokens}`);
            console.log(`   🤖 Model: ${result.metadata.model}`);
            console.log(`   🌡️  Temperature: ${result.metadata.temperature}`);
        } else {
            console.error('❌ Gemini failed to respond:');
            console.error(`   Error: ${result.error}`);
        }
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

// Run the test
testCrawdadsPoem().catch(console.error);
