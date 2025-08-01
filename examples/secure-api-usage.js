#!/usr/bin/env node

import { Injectionator } from '../src/core/Injectionator.js';
import { loadInjectionatorConfig } from '../src/core/InjectionatorConfig.js';
import apiKeyManager from '../src/core/ApiKeyManager.js';
import logger from '../src/core/Logger.js';

/**
 * Secure API Key Usage Example
 * 
 * This example demonstrates how to use the Injectionator with secure API key handling.
 * API keys are never stored in configuration files and must be provided via:
 * 1. Environment variables (recommended)
 * 2. Command-line arguments
 */

const main = async () => {
    const log = logger.withContext('SecureAPIExample');
    
    try {
        // Parse command line arguments for help
        const args = process.argv.slice(2);
        if (args.includes('--help') || args.includes('-h')) {
            showUsage();
            return;
        }

        log.info('Starting secure API key example', {
            event: 'example_start'
        });

        // Load Injectionator configuration (without API keys)
        const configPath = './research/injectionator.json';
        const injectionator = loadInjectionatorConfig(configPath);
        
        log.info('Configuration loaded', {
            name: injectionator.name,
            event: 'config_loaded'
        });

        // Extract required API keys from configuration
        const requiredKeys = extractRequiredApiKeys(injectionator);
        
        if (requiredKeys.length > 0) {
            log.info('Required API keys identified', {
                keys: requiredKeys,
                event: 'keys_identified'
            });

            // Validate that all required API keys are available
            const validation = apiKeyManager.validateKeys(requiredKeys);
            
            if (!validation.valid) {
                log.error('API key validation failed', {
                    missing: validation.missing,
                    message: validation.message,
                    event: 'validation_failed'
                });
                
                console.error('\n❌ Missing API Keys!');
                console.error(validation.message);
                console.error(apiKeyManager.getUsageInstructions(requiredKeys));
                process.exit(1);
            }
            
            log.info('All API keys validated successfully', {
                available: validation.available,
                event: 'validation_success'
            });
        }

        // Test prompt
        const testPrompt = args.find(arg => arg.startsWith('--prompt='))?.split('=')[1] 
                         || "Tell me about prompt injection attacks and how to prevent them.";

        console.log('\n🚀 Executing Injectionator with secure API key handling...');
        console.log(`📝 Prompt: "${testPrompt}"`);
        
        // Execute the injectionator
        const result = await injectionator.execute(testPrompt);
        
        // Display results
        console.log('\n📊 Execution Results:');
        console.log('='.repeat(50));
        console.log(`✅ Success: ${result.success}`);
        console.log(`⏱️  Total Time: ${result.endTime - result.startTime}ms`);
        
        if (result.steps && result.steps.length > 0) {
            console.log('\n🔄 Processing Steps:');
            result.steps.forEach((step, index) => {
                console.log(`  ${index + 1}. ${step.step}: ${step.result?.success ? '✅' : '❌'}`);
            });
        }
        
        if (result.success) {
            console.log('\n💬 Final Response:');
            console.log(`"${result.finalResponse}"`);
        } else {
            console.log('\n❌ Error or Blocked:');
            console.log(`Reason: ${result.error || result.blockedAt}`);
            console.log(`Response: ${result.finalResponse}`);
        }

        // Show API key statistics (without exposing values)
        const keyStats = apiKeyManager.getKeyStats();
        console.log('\n🔐 API Key Statistics:');
        console.log(`  Runtime Keys: ${keyStats.runtimeKeys}`);
        console.log(`  Environment Keys: ${keyStats.environmentKeys}`);
        
        log.info('Example completed successfully', {
            success: result.success,
            processingTime: result.endTime - result.startTime,
            event: 'example_complete'
        });

    } catch (error) {
        log.error('Example failed', {
            error: error.message,
            stack: error.stack,
            event: 'example_error'
        });
        
        console.error('\n❌ Example failed:', error.message);
        process.exit(1);
    } finally {
        // Clear runtime keys for security
        apiKeyManager.clearRuntimeKeys();
    }
};

/**
 * Extract required API keys from Injectionator configuration
 * @param {Injectionator} injectionator - The injectionator instance
 * @returns {Array<string>} List of required API key references
 */
function extractRequiredApiKeys(injectionator) {
    const keys = [];
    
    // Check backend API key requirements
    if (injectionator.llmBackend?.config?.apiKeyRef) {
        keys.push(injectionator.llmBackend.config.apiKeyRef);
    }
    
    // Could add other sources of API key requirements here
    // (webhooks, external services, etc.)
    
    return [...new Set(keys)]; // Remove duplicates
}

/**\n * Show usage instructions\n */
function showUsage() {
    console.log(`
🔐 Secure API Usage Example

USAGE:
  node examples/secure-api-usage.js [options]

OPTIONS:
  --help, -h              Show this help message
  --prompt="your prompt"  Custom prompt to test (optional)

API KEY CONFIGURATION:
  
  Option 1: Environment Variables (Recommended)
    export OPENAI_API_KEY="sk-your-actual-openai-key"
    export ANTHROPIC_API_KEY="sk-your-actual-anthropic-key"
    node examples/secure-api-usage.js

  Option 2: Command Line Arguments
    node examples/secure-api-usage.js \\
      --api-key OPENAI_API_KEY=sk-your-actual-openai-key \\
      --api-key ANTHROPIC_API_KEY=sk-your-actual-anthropic-key

  Option 3: Mixed Approach
    export ANTHROPIC_API_KEY="sk-your-anthropic-key"
    node examples/secure-api-usage.js \\
      --api-key OPENAI_API_KEY=sk-your-openai-key

EXAMPLES:
  # Use environment variables
  OPENAI_API_KEY=sk-xxx node examples/secure-api-usage.js
  
  # Use CLI arguments with custom prompt
  node examples/secure-api-usage.js \\
    --api-key OPENAI_API_KEY=sk-xxx \\
    --prompt="What are the security risks of AI?"

SECURITY NOTES:
  ⚠️  Command line arguments are visible in process lists
  ✅  Environment variables are more secure for production
  ✅  API keys are never stored in configuration files
  ✅  Runtime keys are cleared after execution
`);
}

// Run the example
main().catch(console.error);
