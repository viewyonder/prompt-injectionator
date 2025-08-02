/**
 * PromptInjectionatorCLI - Main CLI application class
 * 
 * Provides an interactive command-line interface for:
 * - Creating and managing Injectionators
 * - Loading and saving configurations
 * - Executing prompts with real-time feedback
 * - Managing mitigations and backends
 * - Monitoring logs and execution history
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { table } from 'table';
import { CLISession } from './CLISession.js';
import { ConfigurationManager } from './ConfigurationManager.js';

export class PromptInjectionatorCLI {
    constructor() {
        this.session = new CLISession();
        this.configManager = new ConfigurationManager();
        this.running = false;
        this.logger = console; // Simple console logger for CLI
    }

    /**
     * Start the CLI application
     */
    async start() {
        this.running = true;
        
        // Display welcome message
        this.displayWelcome();
        
        // Main command loop
        while (this.running) {
            try {
                await this.showMainMenu();
            } catch (error) {
                console.error(chalk.red('Error:'), error.message);
                
                // Ask if user wants to continue
                const { continue: shouldContinue } = await inquirer.prompt([{
                    type: 'confirm',
                    name: 'continue',
                    message: 'Would you like to continue?',
                    default: true
                }]);
                
                if (!shouldContinue) {
                    this.running = false;
                }
            }
        }
        
        await this.cleanup();
        console.log(chalk.yellow('Goodbye! 👋'));
    }

    /**
     * Display welcome message and session info
     */
    displayWelcome() {
        const welcomeMessage = boxen(
            chalk.cyan.bold('🛡️  Prompt Injectionator CLI') + '\n\n' +
            chalk.white('Interactive CLI for managing prompt injection testing\n') +
            chalk.gray(`Session ID: ${this.session.id.substring(0, 8)}...`),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'cyan'
            }
        );
        
        console.log(welcomeMessage);
    }

    /**
     * Show main menu and handle user selection
     */
    async showMainMenu() {
        // Display current status
        this.displayCurrentStatus();
        
        const choices = [
            {
                name: '📦 Create New Injectionator',
                value: 'create'
            },
            {
                name: '📂 Load Configuration from File',
                value: 'load'
            },
            {
                name: '💾 Save Current Configuration',
                value: 'save',
                disabled: !this.session.hasActiveInjectionator() ? 'No active injectionator' : false
            },
            {
                name: '▶️  Execute Prompt',
                value: 'execute',
                disabled: !this.session.hasActiveInjectionator() ? 'No active injectionator' : false
            },
            {
                name: '⚙️  Manage Configuration',
                value: 'manage',
                disabled: !this.session.hasActiveInjectionator() ? 'No active injectionator' : false
            },
            {
                name: '📊 View Session History',
                value: 'history'
            },
            {
                name: '📋 Session Information',
                value: 'info'
            },
            new inquirer.Separator(),
            {
                name: '🚪 Exit',
                value: 'exit'
            }
        ];

        const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: choices,
            pageSize: 12
        }]);

        switch (action) {
            case 'create':
                await this.handleCreateInjectionator();
                break;
            case 'load':
                await this.handleLoadConfiguration();
                break;
            case 'save':
                await this.handleSaveConfiguration();
                break;
            case 'execute':
                await this.handleExecutePrompt();
                break;
            case 'manage':
                await this.handleManageConfiguration();
                break;
            case 'history':
                await this.handleViewHistory();
                break;
            case 'info':
                await this.handleSessionInfo();
                break;
            case 'exit':
                this.running = false;
                break;
        }
    }

    /**
     * Display current status information
     */
    displayCurrentStatus() {
        const summary = this.session.getSummary();
        const statusData = [
            ['Session Duration', summary.duration],
            ['Active Injectionator', summary.activeInjectionator === 'None' ? chalk.gray('None') : chalk.green(summary.activeInjectionator)],
            ['Total Executions', summary.executions.toString()],
            ['Success Rate', summary.successRate === '0%' ? chalk.gray(summary.successRate) : chalk.green(summary.successRate)]
        ];

        const statusTable = table(statusData, {
            border: {
                topBody: `─`,
                topJoin: `┬`,
                topLeft: `┌`,
                topRight: `┐`,
                bottomBody: `─`,
                bottomJoin: `┴`,
                bottomLeft: `└`,
                bottomRight: `┘`,
                bodyLeft: `│`,
                bodyRight: `│`,
                bodyJoin: `│`
            },
            columns: {
                0: { width: 20, alignment: 'right' },
                1: { width: 30, alignment: 'left' }
            }
        });

        console.log('\n' + chalk.bold('Current Status:'));
        console.log(statusTable);
    }

    /**
     * Handle creating a new injectionator
     */
    async handleCreateInjectionator() {
        console.log(chalk.cyan('\n📦 Creating New Injectionator\n'));

        const templates = this.configManager.getAvailableTemplates();
        const templateChoices = templates.map(t => ({
            name: `${t.name} - ${chalk.gray(t.description)}`,
            value: t.name
        }));

        const { creationType } = await inquirer.prompt([{
            type: 'list',
            name: 'creationType',
            message: 'How would you like to create the injectionator?',
            choices: [
                {
                    name: '📄 From Template',
                    value: 'template'
                },
                {
                    name: '🆕 Blank Configuration',
                    value: 'blank'
                }
            ]
        }]);

        const { name, description } = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter injectionator name:',
                validate: input => input.trim().length > 0 || 'Name is required'
            },
            {
                type: 'input',
                name: 'description',
                message: 'Enter description (optional):',
                default: ''
            }
        ]);

        const spinner = ora('Creating injectionator...').start();

        try {
            let result;
            
            if (creationType === 'template') {
                const { template } = await inquirer.prompt([{
                    type: 'list',
                    name: 'template',
                    message: 'Select template:',
                    choices: templateChoices
                }]);
                
                result = await this.configManager.createFromTemplate(template, name, { description });
            } else {
                result = await this.configManager.createBlank(name, { description });
            }

            spinner.stop();

            if (result.success) {
                this.session.setActiveInjectionator(result.injectionator);
                console.log(chalk.green('✅ ') + result.message);
                
                // Display configuration summary
                const summary = this.configManager.getConfigurationSummary(result.injectionator);
                console.log('\nConfiguration Summary:');
                console.log(chalk.gray(JSON.stringify(summary, null, 2)));
            } else {
                console.log(chalk.red('❌ ') + result.message);
            }
        } catch (error) {
            spinner.stop();
            console.log(chalk.red('❌ Failed to create injectionator: ') + error.message);
        }

        await this.pressEnterToContinue();
    }

    /**
     * Handle loading configuration from file
     */
    async handleLoadConfiguration() {
        console.log(chalk.cyan('\n📂 Loading Configuration\n'));

        const spinner = ora('Scanning for configurations...').start();
        
        try {
            const configsResult = await this.configManager.listConfigurations();
            spinner.stop();

            if (!configsResult.success || configsResult.configurations.length === 0) {
                console.log(chalk.yellow('No configuration files found in the configs directory.'));
                return;
            }

            const choices = configsResult.configurations.map(config => ({
                name: `${config.name} - ${chalk.gray(config.description)} ${chalk.dim(`(${config.filename})`)}`,
                value: config.filePath,
                disabled: !config.valid ? `Invalid: ${config.error}` : false
            }));

            const { configPath } = await inquirer.prompt([{
                type: 'list',
                name: 'configPath',
                message: 'Select configuration to load:',
                choices: choices,
                pageSize: 10
            }]);

            const loadSpinner = ora('Loading configuration...').start();
            const loadResult = await this.configManager.loadFromFile(configPath);
            loadSpinner.stop();

            if (loadResult.success) {
                this.session.setActiveInjectionator(loadResult.injectionator);
                console.log(chalk.green('✅ ') + loadResult.message);
                
                // Display configuration summary
                const summary = this.configManager.getConfigurationSummary(loadResult.injectionator);
                console.log('\nConfiguration Summary:');
                console.log(chalk.gray(JSON.stringify(summary, null, 2)));
            } else {
                console.log(chalk.red('❌ ') + loadResult.message);
            }
        } catch (error) {
            spinner.stop();
            console.log(chalk.red('❌ Failed to load configuration: ') + error.message);
        }

        await this.pressEnterToContinue();
    }

    /**
     * Handle saving current configuration
     */
    async handleSaveConfiguration() {
        console.log(chalk.cyan('\n💾 Saving Configuration\n'));

        const injectionator = this.session.getActiveInjectionator();
        const suggestedPath = this.configManager.getSuggestedFilePath(injectionator);

        const { filePath } = await inquirer.prompt([{
            type: 'input',
            name: 'filePath',
            message: 'Enter file path to save to:',
            default: suggestedPath,
            validate: input => input.trim().length > 0 || 'File path is required'
        }]);

        const spinner = ora('Saving configuration...').start();

        try {
            const result = await this.configManager.saveToFile(injectionator, filePath);
            spinner.stop();

            if (result.success) {
                console.log(chalk.green('✅ ') + result.message);
            } else {
                console.log(chalk.red('❌ ') + result.message);
            }
        } catch (error) {
            spinner.stop();
            console.log(chalk.red('❌ Failed to save configuration: ') + error.message);
        }

        await this.pressEnterToContinue();
    }

    /**
     * Handle prompt execution
     */
    async handleExecutePrompt() {
        console.log(chalk.cyan('\n▶️  Executing Prompt\n'));

        const { promptText } = await inquirer.prompt([{
            type: 'input',
            name: 'promptText',
            message: 'Enter your prompt:',
            validate: input => input.trim().length > 0 || 'Prompt cannot be empty'
        }]);

        const spinner = ora('Processing prompt...').start();

        try {
            const injectionator = this.session.getActiveInjectionator();
            const result = await injectionator.execute(promptText);
            
            spinner.stop();

            // Log execution to session
            this.session.logExecution(promptText, result);

            // Display result
            console.log(chalk.bold('\nExecution Result:'));
            console.log('─'.repeat(50));
            
            if (result.success) {
                console.log(chalk.green('✅ Status: SUCCESS'));
                console.log(chalk.bold('Response:'));
                console.log(chalk.white(result.finalResponse));
            } else {
                console.log(chalk.red('❌ Status: BLOCKED'));
                console.log(chalk.bold(`Blocked at: ${result.blockedAt}`));
                console.log(chalk.yellow('Response:'));
                console.log(chalk.white(result.finalResponse));
            }

            console.log(chalk.gray(`\nProcessing Time: ${new Date(result.endTime) - new Date(result.startTime)}ms`));
            console.log(chalk.gray(`Steps: ${result.steps.length}`));

            // Ask if user wants to see detailed execution steps
            const { showDetails } = await inquirer.prompt([{
                type: 'confirm',
                name: 'showDetails',
                message: 'Show detailed execution steps?',
                default: false
            }]);

            if (showDetails) {
                console.log(chalk.bold('\nDetailed Execution Steps:'));
                result.steps.forEach((step, index) => {
                    console.log(chalk.cyan(`\n${index + 1}. ${step.step.toUpperCase()}`));
                    console.log(chalk.gray(`   Chain/Backend: ${step.chainName || step.backendName || 'Unknown'}`));
                    console.log(chalk.gray(`   Result: ${step.result.passed !== undefined ? (step.result.passed ? 'PASSED' : 'BLOCKED') : (step.result.success ? 'SUCCESS' : 'FAILED')}`));
                });
            }

        } catch (error) {
            spinner.stop();
            console.log(chalk.red('❌ Execution failed: ') + error.message);
        }

        await this.pressEnterToContinue();
    }

    /**
     * Handle configuration management
     */
    async handleManageConfiguration() {
        console.log(chalk.cyan('\n⚙️  Managing Configuration\n'));

        const injectionator = this.session.getActiveInjectionator();
        const summary = this.configManager.getConfigurationSummary(injectionator);

        console.log('Current Configuration:');
        console.log(chalk.gray(JSON.stringify(summary, null, 2)));

        const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                {
                    name: '📋 View Full Configuration',
                    value: 'view'
                },
                {
                    name: '✏️  Export Configuration JSON',
                    value: 'export'
                },
                {
                    name: '🔄 Validate Configuration',
                    value: 'validate'
                },
                {
                    name: '🔙 Back to Main Menu',
                    value: 'back'
                }
            ]
        }]);

        switch (action) {
            case 'view':
                console.log('\nFull Configuration:');
                console.log(chalk.gray(this.configManager.exportConfiguration(injectionator)));
                break;
            case 'export':
                console.log('\nExported JSON Configuration:');
                console.log(this.configManager.exportConfiguration(injectionator));
                break;
            case 'validate':
                const validation = injectionator.validate();
                console.log(chalk.bold('\nValidation Result:'));
                if (validation.valid) {
                    console.log(chalk.green('✅ Configuration is valid'));
                } else {
                    console.log(chalk.red('❌ Configuration has issues:'));
                    validation.issues.forEach(issue => {
                        console.log(chalk.red(`  • ${issue}`));
                    });
                }
                break;
            case 'back':
                return;
        }

        if (action !== 'back') {
            await this.pressEnterToContinue();
        }
    }

    /**
     * Handle viewing session history
     */
    async handleViewHistory() {
        console.log(chalk.cyan('\n📊 Session History\n'));

        const history = this.session.getExecutionHistory(20);

        if (history.length === 0) {
            console.log(chalk.yellow('No execution history yet.'));
            await this.pressEnterToContinue();
            return;
        }

        console.log(chalk.bold(`Recent Executions (${history.length}):`));
        console.log('─'.repeat(80));

        history.forEach((execution, index) => {
            const status = execution.result.success ? chalk.green('✅ SUCCESS') : chalk.red('❌ BLOCKED');
            const timestamp = new Date(execution.timestamp).toLocaleTimeString();
            const prompt = execution.prompt.length > 50 ? 
                execution.prompt.substring(0, 47) + '...' : 
                execution.prompt;

            console.log(`${chalk.gray(timestamp)} ${status} ${chalk.white(prompt)}`);
        });

        // Show statistics
        const stats = this.session.getSessionStats();
        console.log('\n' + chalk.bold('Statistics:'));
        console.log(`Total Executions: ${stats.totalExecutions}`);
        console.log(`Success Rate: ${chalk.green(stats.successRate)}`);
        console.log(`Successful: ${chalk.green(stats.successfulExecutions)}`);
        console.log(`Blocked: ${chalk.red(stats.blockedExecutions)}`);

        await this.pressEnterToContinue();
    }

    /**
     * Handle viewing session information
     */
    async handleSessionInfo() {
        console.log(chalk.cyan('\n📋 Session Information\n'));

        const stats = this.session.getSessionStats();
        const sessionData = [
            ['Session ID', stats.sessionId.substring(0, 8) + '...'],
            ['Start Time', stats.startTime.toLocaleString()],
            ['Duration', this.session.formatDuration(stats.duration)],
            ['Active Injectionator', stats.activeInjectionator],
            ['Total Executions', stats.totalExecutions.toString()],
            ['Success Rate', stats.successRate],
            ['Total Logs', stats.totalLogs.toString()]
        ];

        const sessionTable = table(sessionData, {
            border: {
                topBody: `─`,
                topJoin: `┬`,
                topLeft: `┌`,
                topRight: `┐`,
                bottomBody: `─`,
                bottomJoin: `┴`,
                bottomLeft: `└`,
                bottomRight: `┘`,
                bodyLeft: `│`,
                bodyRight: `│`,
                bodyJoin: `│`
            },
            columns: {
                0: { width: 20, alignment: 'right' },
                1: { width: 30, alignment: 'left' }
            }
        });

        console.log(sessionTable);

        // Show recent logs
        const recentLogs = this.session.getRecentLogs(5);
        if (recentLogs.length > 0) {
            console.log(chalk.bold('\nRecent Logs:'));
            recentLogs.forEach(log => {
                const level = log.level.toUpperCase();
                const levelColor = level === 'ERROR' ? chalk.red : 
                                  level === 'WARN' ? chalk.yellow : 
                                  level === 'INFO' ? chalk.blue : chalk.gray;
                const timestamp = new Date(log.timestamp).toLocaleTimeString();
                console.log(`${chalk.gray(timestamp)} ${levelColor(level)} ${log.message}`);
            });
        }

        await this.pressEnterToContinue();
    }

    /**
     * Utility function to pause execution until user presses Enter
     */
    async pressEnterToContinue() {
        await inquirer.prompt([{
            type: 'input',
            name: 'continue',
            message: chalk.dim('Press Enter to continue...')
        }]);
    }

    /**
     * Cleanup resources before shutdown
     */
    async cleanup() {
        await this.session.cleanup();
    }
}
