#!/usr/bin/env node

/**
 * Entry point for the Prompt Injectionator Interactive CLI
 * 
 * This CLI provides a user-friendly interface for:
 * - Creating and managing Injectionators
 * - Loading and saving configurations
 * - Executing prompts with real-time feedback
 * - Managing mitigations and backends
 * - Monitoring logs and execution history
 */

import { PromptInjectionatorCLI } from './PromptInjectionatorCLI.js';
import chalk from 'chalk';

// Mock crypto.randomUUID for ES modules if not available
if (!globalThis.crypto?.randomUUID) {
    globalThis.crypto = {
        randomUUID: () => 'cli-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    };
}

async function main() {
    try {
        // Create and start the CLI
        const cli = new PromptInjectionatorCLI();
        
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n\n' + chalk.yellow('Shutting down gracefully...'));
            await cli.cleanup();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\n\n' + chalk.yellow('Received SIGTERM, shutting down...'));
            await cli.cleanup();
            process.exit(0);
        });
        
        // Start the CLI
        await cli.start();
        
    } catch (error) {
        console.error(chalk.red('Failed to start CLI:'), error.message);
        console.error(chalk.gray('Stack trace:'), error.stack);
        process.exit(1);
    }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main };
