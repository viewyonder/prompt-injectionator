import chalk from 'chalk';

/**
 * ExecutionLogger creates human-readable logs from execution results.
 */
export class ExecutionLogger {
    /**
     * Create a complete execution log from execution result
     * @param {object} executionResult - The result from injectionator.execute()
     * @param {string} injectionatorName - Name of the injectionator
     * @returns {string} Formatted execution log
     */
    static createExecutionLog(executionResult, injectionatorName) {
        const lines = [];
        
        // Header
        lines.push(chalk.bold.cyan(`🚀 EXECUTION LOG for "${injectionatorName}"`));
        lines.push(chalk.cyan('═'.repeat(60)));
        
        // User prompt (truncated if too long)
        const promptPreview = executionResult.userPrompt.length > 50 
            ? executionResult.userPrompt.substring(0, 47) + '...'
            : executionResult.userPrompt;
        lines.push(chalk.bold(`📝 User Prompt: `) + chalk.white(`"${promptPreview}"`));
        
        // Start time
        const startTime = new Date(executionResult.startTime).toLocaleTimeString();
        lines.push(chalk.gray(`⏱️  Started: ${startTime}`));
        lines.push('');
        
        // Process each step
        for (const step of executionResult.steps) {
            lines.push(this.formatStep(step));
        }
        
        // Final result
        lines.push('');
        if (executionResult.success) {
            lines.push(chalk.green('📊 RESULT: SUCCESS'));
            lines.push(chalk.green('✅ Response delivered successfully'));
        } else {
            lines.push(chalk.red('📊 RESULT: BLOCKED'));
            if (executionResult.blockedAt) {
                const blockedAtFormatted = executionResult.blockedAt.replace('_', ' ').toUpperCase();
                lines.push(chalk.red(`❌ Request blocked at: ${blockedAtFormatted}`));
            }
        }
        
        // Timing
        const endTime = new Date(executionResult.endTime).toLocaleTimeString();
        const duration = new Date(executionResult.endTime) - new Date(executionResult.startTime);
        lines.push(chalk.gray(`⏱️  Completed: ${endTime} (${duration}ms)`));
        
        return lines.join('\n');
    }
    
    /**
     * Format an individual execution step
     * @param {object} step - Individual step from execution result
     * @returns {string} Formatted step
     */
    static formatStep(step) {
        const lines = [];
        
        switch (step.step) {
            case 'send_chain':
                lines.push(chalk.cyan('📤 SEND CHAIN: Processing...'));
                if (step.result.passed) {
                    lines.push(chalk.green('  ✅ All mitigations passed'));
                } else {
                    lines.push(chalk.red(`  ❌ BLOCKED by: ${step.result.blockedBy || 'Unknown mitigation'}`));
                    if (step.result.reason) {
                        lines.push(chalk.yellow(`  📝 Reason: ${step.result.reason}`));
                    }
                    lines.push(chalk.red('  🛑 EXECUTION STOPPED - Request blocked by Send Chain'));
                }
                break;
                
            case 'llm_backend':
                lines.push(chalk.blue('🔗 LLM BACKEND: Processing...'));
                if (step.result.success) {
                    lines.push(chalk.green('  ✅ LLM response received'));
                    const responseLength = step.result.response ? step.result.response.length : 0;
                    lines.push(chalk.gray(`  📏 Response length: ${responseLength} characters`));
                } else {
                    lines.push(chalk.red('  ❌ LLM call failed'));
                    if (step.result.error) {
                        lines.push(chalk.yellow(`  📝 Error: ${step.result.error}`));
                    }
                }
                break;
                
            case 'receive_chain':
                lines.push(chalk.magenta('📥 RECEIVE CHAIN: Processing...'));
                if (step.result.passed) {
                    lines.push(chalk.green('  ✅ All mitigations passed'));
                } else {
                    lines.push(chalk.red(`  ❌ BLOCKED by: ${step.result.blockedBy || 'Unknown mitigation'}`));
                    if (step.result.reason) {
                        lines.push(chalk.yellow(`  📝 Reason: ${step.result.reason}`));
                    }
                    lines.push(chalk.red('  🛑 EXECUTION STOPPED - Response blocked by Receive Chain'));
                }
                break;
                
            default:
                lines.push(chalk.gray(`🔧 ${step.step.toUpperCase()}: ${step.result.success ? 'SUCCESS' : 'FAILED'}`));
        }
        
        return lines.join('\n');
    }
    
    /**
     * Format timestamp consistently
     * @param {Date|string} timestamp - Timestamp to format
     * @returns {string} Formatted timestamp
     */
    static formatTimestamp(timestamp) {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
        return date.toLocaleTimeString();
    }
    
    /**
     * Create a simple execution summary
     * @param {object} executionResult - The result from injectionator.execute()
     * @returns {string} Short summary
     */
    static createSummary(executionResult) {
        const status = executionResult.success ? 
            chalk.green('✅ SUCCESS') : 
            chalk.red('❌ BLOCKED');
        
        const duration = new Date(executionResult.endTime) - new Date(executionResult.startTime);
        const promptPreview = executionResult.userPrompt.length > 30 
            ? executionResult.userPrompt.substring(0, 27) + '...'
            : executionResult.userPrompt;
            
        return `${status} "${promptPreview}" (${duration}ms)`;
    }
}
