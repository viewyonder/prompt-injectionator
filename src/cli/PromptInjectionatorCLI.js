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
import { InjectionatorVisualizer } from './utils/InjectionatorVisualizer.js';
import { ExecutionLogger } from './utils/ExecutionLogger.js';
import { ConfigurationManager } from './ConfigurationManager.js';
import fs from 'fs';
import path from 'path';
import { createBackend, BackendTypes } from '../backends/index.js';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
     * Display welcome message with ASCII banner and session info
     */
    displayWelcome() {
        // Clear screen for clean startup
        console.clear();
        
        // Try to load and display ASCII banner
        this.displayBanner();
        
        // Display session info in a box
        const sessionInfo = boxen(
            chalk.white('Interactive CLI for managing prompt injection testing\n') +
            chalk.gray(`Session ID: ${this.session.id.substring(0, 8)}... | Started: ${new Date().toLocaleTimeString()}`),
            {
                padding: 1,
                margin: { top: 1, bottom: 1, left: 2, right: 2 },
                borderStyle: 'round',
                borderColor: 'cyan',
                title: chalk.cyan.bold('🛡️  Welcome to Prompt Injectionator CLI'),
                titleAlignment: 'center'
            }
        );
        
        console.log(sessionInfo);
    }

    /**
     * Load and display ASCII art banner
     */
    displayBanner() {
        try {
            const bannerPath = path.join(__dirname, 'assets', 'banner.txt');
            
            if (fs.existsSync(bannerPath)) {
                const banner = fs.readFileSync(bannerPath, 'utf-8');
                // Display banner with cyan color
                console.log(chalk.cyan(banner));
            } else {
                // Fallback to simple text banner if file not found
                console.log(chalk.cyan.bold(`

🛡️   PROMPT INJECTIONATOR   🛡️`));
                console.log(chalk.cyan('Don\'t be a prompt injection hater! -- Get Prompt Injectionator!'));
                console.log(chalk.gray('Built by meatbags.\n'));
            }
        } catch (error) {
            // Silently fall back to simple banner if there's any error
            console.log(chalk.cyan.bold(`

🛡️   PROMPT INJECTIONATOR   🛡️`));
            console.log(chalk.cyan('Don\'t be a prompt injection hater! -- Get Prompt Injectionator!'));
            console.log(chalk.gray('Built by meatbags.\n'));
        }
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
  name: '🔧 Select Backend',
  value:'select_backend'
},
{
  name: '⚙️  Manage Configuration',
  value: 'manage',
  disabled: !this.session.hasActiveInjectionator() ? 'No active injectionator' : false
},
            {
                name: '📊 View Injectionator Diagram',
                value: 'diagram',
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
            case 'diagram':
                await this.displayInjectionatorDiagram();
                break;
case 'select_backend':
    await this.handleSelectBackend();
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
     * Display the Injectionator diagram
     */
    async displayInjectionatorDiagram() {
        console.log(chalk.cyan('\n📊 Injectionator Diagram\n'));
        const injectionator = this.session.getActiveInjectionator();
        InjectionatorVisualizer.renderDiagram(injectionator);

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

            // Display human-readable execution log
            const executionLog = ExecutionLogger.createExecutionLog(result, injectionator.name);
            console.log(executionLog);

            // Display the backend response if execution was successful
            if (result.success) {
                // Try multiple possible field names for the response
                const backendResponse = result.finalResponse || 
                                      result.llmResponse || 
                                      result.response || 
                                      (result.steps && result.steps.find(s => s.step === 'llm_backend')?.result?.response);
                
                if (backendResponse) {
                    console.log('\n' + boxen(
                        chalk.white.bold('🤖 Backend Response:\n\n') + 
                        chalk.cyan(backendResponse),
                        {
                            padding: 1,
                            margin: { top: 1, bottom: 1, left: 0, right: 0 },
                            borderStyle: 'round',
                            borderColor: 'green',
                            title: chalk.green.bold('✅ Response'),
                            titleAlignment: 'left'
                        }
                    ));
                }
            } else {
                // Show why it was blocked
                const blockReason = result.reason || result.blockedReason || 
                                  (result.steps && result.steps.find(s => !s.result?.passed)?.result?.reason) ||
                                  'Request was blocked by security mitigations';
                                  
                console.log('\n' + boxen(
                    chalk.red.bold('🚫 Execution Blocked\n\n') + 
                    chalk.yellow(blockReason),
                    {
                        padding: 1,
                        margin: { top: 1, bottom: 1, left: 0, right: 0 },
                        borderStyle: 'round',
                        borderColor: 'red',
                        title: chalk.red.bold('❌ Blocked'),
                        titleAlignment: 'left'
                    }
                ));
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
                    name: '🔧 Manage Mitigations',
                    value: 'mitigations'
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
            case 'mitigations':
                await this.handleMitigationManagement();
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
     * Handle mitigation management - attach/detach mitigations to chains
     */
    async handleMitigationManagement() {
        console.log(chalk.cyan('\n🔧 Managing Mitigations\n'));

        const injectionator = this.session.getActiveInjectionator();
        
        // Show current mitigation status
        this.displayMitigationStatus(injectionator);

        const { chainType } = await inquirer.prompt([{
            type: 'list',
            name: 'chainType',
            message: 'Which chain would you like to manage?',
            choices: [
                {
                    name: '📤 Send Chain (Pre-LLM Processing)',
                    value: 'send'
                },
                {
                    name: '📥 Receive Chain (Post-LLM Processing)',
                    value: 'receive'
                },
                {
                    name: '🔙 Back to Configuration Menu',
                    value: 'back'
                }
            ]
        }]);

        if (chainType === 'back') {
            return;
        }

        const chain = chainType === 'send' ? injectionator.sendChain : injectionator.receiveChain;
        if (!chain) {
            console.log(chalk.red(`❌ ${chainType === 'send' ? 'Send' : 'Receive'} chain is not configured.`));
            await this.pressEnterToContinue();
            return;
        }

        await this.manageChainingMitigations(chain, chainType, injectionator);
    }

    /**
     * Display current mitigation status for both chains
     */
    displayMitigationStatus(injectionator) {
        console.log(chalk.bold('Current Mitigation Status:'));
        console.log('─'.repeat(60));

        // Send Chain Status
        if (injectionator.sendChain) {
            console.log(chalk.cyan('\n📤 Send Chain:'));
            if (injectionator.sendChain.mitigations.length === 0) {
                console.log(chalk.gray('  No mitigations attached'));
            } else {
                injectionator.sendChain.mitigations.forEach((mitigation, index) => {
                    const status = mitigation.state === 'On' ? chalk.green('✓ Active') : chalk.gray('✘ Inactive');
                    const mode = mitigation.mode === 'Active' ? chalk.red('[Active]') : chalk.yellow('[Passive]');
                    console.log(`  ${index + 1}. ${chalk.white(mitigation.name)} ${status} ${mode}`);
                    console.log(`     ${chalk.gray(mitigation.description || 'No description')}`);
                });
            }
        } else {
            console.log(chalk.gray('\n📤 Send Chain: Not configured'));
        }

        // Receive Chain Status
        if (injectionator.receiveChain) {
            console.log(chalk.cyan('\n📥 Receive Chain:'));
            if (injectionator.receiveChain.mitigations.length === 0) {
                console.log(chalk.gray('  No mitigations attached'));
            } else {
                injectionator.receiveChain.mitigations.forEach((mitigation, index) => {
                    const status = mitigation.state === 'On' ? chalk.green('✓ Active') : chalk.gray('✘ Inactive');
                    const mode = mitigation.mode === 'Active' ? chalk.red('[Active]') : chalk.yellow('[Passive]');
                    console.log(`  ${index + 1}. ${chalk.white(mitigation.name)} ${status} ${mode}`);
                    console.log(`     ${chalk.gray(mitigation.description || 'No description')}`);
                });
            }
        } else {
            console.log(chalk.gray('\n📥 Receive Chain: Not configured'));
        }

        console.log('');
    }

    /**
     * Manage mitigations for a specific chain
     */
    async manageChainingMitigations(chain, chainType, injectionator) {
        const chainName = chainType === 'send' ? 'Send Chain' : 'Receive Chain';
        
        while (true) {
            console.log(chalk.cyan(`\n🔧 Managing ${chainName}\n`));
            
            // Display current mitigations in this chain
            this.displayChainMitigations(chain, chainName);
            
            const choices = [
                {
                    name: '➕ Attach New Mitigation',
                    value: 'attach'
                },
                {
                    name: '➖ Detach Existing Mitigation',
                    value: 'detach',
                    disabled: chain.mitigations.length === 0 ? 'No mitigations to detach' : false
                },
                {
                    name: '🔄 Toggle Mitigation State (On/Off)',
                    value: 'toggle',
                    disabled: chain.mitigations.length === 0 ? 'No mitigations to toggle' : false
                },
                {
                    name: '⚙️ Change Mitigation Mode (Active/Passive)',
                    value: 'mode',
                    disabled: chain.mitigations.length === 0 ? 'No mitigations to modify' : false
                },
                {
                    name: '🔄 Reorder Mitigations',
                    value: 'reorder',
                    disabled: chain.mitigations.length < 2 ? 'Need at least 2 mitigations to reorder' : false
                },
                {
                    name: '🔙 Back to Chain Selection',
                    value: 'back'
                }
            ];

            const { action } = await inquirer.prompt([{
                type: 'list',
                name: 'action',
                message: `What would you like to do with the ${chainName}?`,
                choices: choices
            }]);

            switch (action) {
                case 'attach':
                    await this.attachMitigation(chain, chainType, injectionator);
                    break;
                case 'detach':
                    await this.detachMitigation(chain, chainName);
                    break;
                case 'toggle':
                    await this.toggleMitigationState(chain, chainName);
                    break;
                case 'mode':
                    await this.changeMitigationMode(chain, chainName);
                    break;
                case 'reorder':
                    await this.reorderMitigations(chain, chainName);
                    break;
                case 'back':
                    return;
            }

            // Mark injectionator as modified
            injectionator.lastModified = new Date();
        }
    }

    /**
     * Display mitigations in a specific chain
     */
    displayChainMitigations(chain, chainName) {
        console.log(`Current ${chainName} Mitigations:`);
        if (chain.mitigations.length === 0) {
            console.log(chalk.gray('  No mitigations attached'));
        } else {
            chain.mitigations.forEach((mitigation, index) => {
                const status = mitigation.state === 'On' ? chalk.green('✓') : chalk.red('✘');
                const mode = mitigation.mode === 'Active' ? chalk.red('[Active]') : chalk.yellow('[Passive]');
                console.log(`  ${index + 1}. ${status} ${chalk.white(mitigation.name)} ${mode}`);
                console.log(`     ${chalk.gray(mitigation.description || 'No description')}`);
            });
        }
        console.log('');
    }

    /**
     * Attach a new mitigation to a chain
     */
    async attachMitigation(chain, chainType, injectionator) {
        console.log(chalk.cyan(`\n➕ Attaching Mitigation to ${chainType === 'send' ? 'Send' : 'Receive'} Chain\n`));

        // Get available injections from the injectionator config
        const availableInjections = Object.keys(injectionator.injections || {});
        
        if (availableInjections.length === 0) {
            console.log(chalk.yellow('⚠️  No injection patterns are available. You need to add injection patterns first.'));
            await this.pressEnterToContinue();
            return;
        }

        // Filter injections that are compatible with this chain type
        const compatibleInjections = availableInjections.filter(injectionName => {
            const injection = injectionator.injections[injectionName];
            // For now, assume all injections can be used in both chains
            // In a real implementation, you might want to check injection.pipeline property
            return true;
        });

        if (compatibleInjections.length === 0) {
            console.log(chalk.yellow(`⚠️  No injection patterns are compatible with ${chainType} chains.`));
            await this.pressEnterToContinue();
            return;
        }

        const injectionChoices = compatibleInjections.map(injectionName => {
            const injection = injectionator.injections[injectionName];
            return {
                name: `${injection.name} - ${chalk.gray(injection.description || 'No description')}`,
                value: injectionName
            };
        });

        const { selectedInjection } = await inquirer.prompt([{
            type: 'list',
            name: 'selectedInjection',
            message: 'Select an injection pattern to create a mitigation:',
            choices: injectionChoices,
            pageSize: 10
        }]);

        const injection = injectionator.injections[selectedInjection];

        // Get mitigation details
        const mitigationDetails = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter mitigation name:',
                default: injection.type || injection.name,
                validate: input => input.trim().length > 0 || 'Name is required'
            },
            {
                type: 'input',
                name: 'description',
                message: 'Enter mitigation description (optional):',
                default: injection.description || ''
            },
            {
                type: 'list',
                name: 'mode',
                message: 'Select mitigation mode:',
                choices: [
                    {
                        name: 'Active - Blocks execution when detected',
                        value: 'Active'
                    },
                    {
                        name: 'Passive - Logs detection but allows execution',
                        value: 'Passive'
                    }
                ],
                default: 'Active'
            },
            {
                type: 'list',
                name: 'state',
                message: 'Initial state:',
                choices: [
                    { name: 'On - Mitigation is active', value: 'On' },
                    { name: 'Off - Mitigation is disabled', value: 'Off' }
                ],
                default: 'On'
            }
        ]);

        try {
            // Create mitigation (this would need to be implemented in your core classes)
            const newMitigation = {
                id: crypto.randomUUID(),
                name: mitigationDetails.name,
                description: mitigationDetails.description,
                pipeline: chainType, // 'send' or 'receive'
                state: mitigationDetails.state,
                mode: mitigationDetails.mode,
                injections: [injection], // Array of injection objects
                action: mitigationDetails.mode === 'Active' ? 'abort' : 'flag'
            };

            // Add mitigation to chain
            chain.addMitigation(newMitigation);
            
            console.log(chalk.green(`\n✅ Successfully attached '${mitigationDetails.name}' to ${chainType === 'send' ? 'Send' : 'Receive'} Chain`));
            
            this.session.log('info', `Attached mitigation '${mitigationDetails.name}' to ${chainType} chain`);
            
        } catch (error) {
            console.log(chalk.red(`\n❌ Failed to attach mitigation: ${error.message}`));
        }

        await this.pressEnterToContinue();
    }

    /**
     * Detach a mitigation from a chain
     */
    async detachMitigation(chain, chainName) {
        console.log(chalk.cyan(`\n➖ Detaching Mitigation from ${chainName}\n`));

        const choices = chain.mitigations.map((mitigation, index) => ({
            name: `${mitigation.name} - ${chalk.gray(mitigation.description || 'No description')}`,
            value: index
        }));

        const { mitigationIndex } = await inquirer.prompt([{
            type: 'list',
            name: 'mitigationIndex',
            message: 'Select mitigation to detach:',
            choices: choices
        }]);

        const mitigationToRemove = chain.mitigations[mitigationIndex];
        
        const { confirm } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to detach '${mitigationToRemove.name}'?`,
            default: false
        }]);

        if (confirm) {
            try {
                chain.removeMitigation(mitigationToRemove.id);
                console.log(chalk.green(`\n✅ Successfully detached '${mitigationToRemove.name}' from ${chainName}`));
                this.session.log('info', `Detached mitigation '${mitigationToRemove.name}' from chain`);
            } catch (error) {
                console.log(chalk.red(`\n❌ Failed to detach mitigation: ${error.message}`));
            }
        } else {
            console.log(chalk.yellow('\n❌ Detachment cancelled'));
        }

        await this.pressEnterToContinue();
    }

    /**
     * Toggle mitigation state (On/Off)
     */
    async toggleMitigationState(chain, chainName) {
        console.log(chalk.cyan(`\n🔄 Toggling Mitigation State in ${chainName}\n`));

        const choices = chain.mitigations.map((mitigation, index) => {
            const currentState = mitigation.state === 'On' ? chalk.green('✓ On') : chalk.red('✘ Off');
            return {
                name: `${mitigation.name} - Currently ${currentState}`,
                value: index
            };
        });

        const { mitigationIndex } = await inquirer.prompt([{
            type: 'list',
            name: 'mitigationIndex',
            message: 'Select mitigation to toggle:',
            choices: choices
        }]);

        const mitigation = chain.mitigations[mitigationIndex];
        const newState = mitigation.state === 'On' ? 'Off' : 'On';
        
        mitigation.state = newState;
        
        const stateColor = newState === 'On' ? chalk.green('ON') : chalk.red('OFF');
        console.log(chalk.green(`\n✅ '${mitigation.name}' is now ${stateColor}`));
        
        this.session.log('info', `Toggled mitigation '${mitigation.name}' to ${newState}`);
        
        await this.pressEnterToContinue();
    }

    /**
     * Change mitigation mode (Active/Passive)
     */
    async changeMitigationMode(chain, chainName) {
        console.log(chalk.cyan(`\n⚙️ Changing Mitigation Mode in ${chainName}\n`));

        const choices = chain.mitigations.map((mitigation, index) => {
            const currentMode = mitigation.mode === 'Active' ? chalk.red('[Active]') : chalk.yellow('[Passive]');
            return {
                name: `${mitigation.name} - Currently ${currentMode}`,
                value: index
            };
        });

        const { mitigationIndex } = await inquirer.prompt([{
            type: 'list',
            name: 'mitigationIndex',
            message: 'Select mitigation to change mode:',
            choices: choices
        }]);

        const mitigation = chain.mitigations[mitigationIndex];
        
        const { newMode } = await inquirer.prompt([{
            type: 'list',
            name: 'newMode',
            message: `Change mode for '${mitigation.name}':`,
            choices: [
                {
                    name: 'Active - Blocks execution when patterns are detected',
                    value: 'Active'
                },
                {
                    name: 'Passive - Logs detection but allows execution to continue',
                    value: 'Passive'
                }
            ],
            default: mitigation.mode
        }]);

        mitigation.mode = newMode;
        mitigation.action = newMode === 'Active' ? 'abort' : 'flag';
        
        const modeColor = newMode === 'Active' ? chalk.red('ACTIVE') : chalk.yellow('PASSIVE');
        console.log(chalk.green(`\n✅ '${mitigation.name}' mode changed to ${modeColor}`));
        
        this.session.log('info', `Changed mitigation '${mitigation.name}' mode to ${newMode}`);
        
        await this.pressEnterToContinue();
    }

    /**
     * Reorder mitigations in a chain
     */
    async reorderMitigations(chain, chainName) {
        console.log(chalk.cyan(`\n🔄 Reordering Mitigations in ${chainName}\n`));
        console.log('Current order:');
        
        chain.mitigations.forEach((mitigation, index) => {
            console.log(`  ${index + 1}. ${mitigation.name}`);
        });
        
        const choices = chain.mitigations.map((mitigation, index) => ({
            name: `${index + 1}. ${mitigation.name}`,
            value: index
        }));

        const { fromIndex } = await inquirer.prompt([{
            type: 'list',
            name: 'fromIndex',
            message: 'Select mitigation to move:',
            choices: choices
        }]);

        const { toIndex } = await inquirer.prompt([{
            type: 'list',
            name: 'toIndex',
            message: `Move '${chain.mitigations[fromIndex].name}' to position:`,
            choices: choices.map((choice, index) => ({
                ...choice,
                name: `Position ${index + 1}${index === fromIndex ? ' (current)' : ''}`
            }))
        }]);

        if (fromIndex !== toIndex) {
            try {
                chain.reorderMitigation(fromIndex, toIndex);
                console.log(chalk.green(`\n✅ Successfully moved '${chain.mitigations[toIndex].name}' to position ${toIndex + 1}`));
                
                console.log('\nNew order:');
                chain.mitigations.forEach((mitigation, index) => {
                    console.log(`  ${index + 1}. ${mitigation.name}`);
                });
                
                this.session.log('info', `Reordered mitigations in ${chainName}`);
                
            } catch (error) {
                console.log(chalk.red(`\n❌ Failed to reorder mitigations: ${error.message}`));
            }
        } else {
            console.log(chalk.yellow('\n❌ No change - same position selected'));
        }

        await this.pressEnterToContinue();
    }

    /**
     * Handle backend selection
     */
    async handleSelectBackend() {
        console.log(chalk.cyan('\n🔧 Selecting a Backend\n'));

        const backendsConfigPath = path.join(process.cwd(), 'backends.json');
        
        if (!fs.existsSync(backendsConfigPath)) {
            console.log(chalk.red('❌ backends.json configuration file not found.'));
            await this.pressEnterToContinue();
            return;
        }

        try {
            const backendsConfig = JSON.parse(fs.readFileSync(backendsConfigPath, 'utf8'));

            const backendChoices = backendsConfig.backends.map(backend => ({
                name: `${backend.name} - ${chalk.gray(backend.description)}`,
                value: backend.id
            }));

            const { selectedBackendId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'selectedBackendId',
                    message: 'Select a backend:',
                    choices: backendChoices
                }
            ]);

            const selectedBackend = backendsConfig.backends.find(backend => backend.id === selectedBackendId);
            let config = { ...selectedBackend.config };

            // Handle API key requirements
            if (selectedBackend.requiresApiKey) {
                const apiKey = process.env[selectedBackend.apiKeyEnvVar];
                if (!apiKey) {
                    console.log(chalk.yellow(`⚠️  ${selectedBackend.name} requires an API key.`));
                    console.log(chalk.gray(`Please set the ${selectedBackend.apiKeyEnvVar} environment variable.`));
                    console.log(chalk.gray('Continuing with mockup mode...'));
                    config.provider = 'mockup';
                } else {
                    config.apiKeyRef = selectedBackend.apiKeyEnvVar;
                }
            }

            const spinner = ora('Creating backend...').start();
            
            try {
                const backend = await createBackend(selectedBackend.type, selectedBackend.name, config);
                this.session.setActiveBackend(backend);
                
                spinner.stop();
                console.log(chalk.green(`✅ Selected backend: ${selectedBackend.name}`));
                
                // Update existing injectionator with new backend if one exists
                if (this.session.hasActiveInjectionator()) {
                    const injectionator = this.session.getActiveInjectionator();
                    injectionator.llmBackend = backend;
                    console.log(chalk.green(`✅ Updated active injectionator with new backend`));
                }
                
                this.session.log('info', `Selected backend: ${selectedBackend.name}`);
                
            } catch (error) {
                spinner.stop();
                console.log(chalk.red(`❌ Failed to create backend: ${error.message}`));
            }
            
        } catch (error) {
            console.log(chalk.red(`❌ Error reading backends configuration: ${error.message}`));
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
