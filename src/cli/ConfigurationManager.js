/**
 * ConfigurationManager - Handles configuration file operations for the CLI
 * 
 * Provides a high-level interface for:
 * - Loading configurations from files
 * - Saving configurations to files
 * - Configuration validation
 * - Configuration templates
 * - Integration with InjectionatorFactory
 */

import fs from 'fs';
import path from 'path';
import { InjectionatorFactory } from '../core/InjectionatorFactory.js';
import { Injectionator } from '../core/Injectionator.js';

export class ConfigurationManager {
    constructor() {
        this.factory = new InjectionatorFactory();
        this.defaultConfigDir = './configs';
        this.templates = new Map();
        this._initializeTemplates();
    }

    /**
     * Load an injectionator from a configuration file
     * @param {string} filePath - Path to the configuration file
     * @returns {Promise<Injectionator>} Loaded injectionator instance
     */
    async loadFromFile(filePath) {
        try {
            const injectionator = await this.factory.createFromFile(filePath);
            return {
                success: true,
                injectionator: injectionator,
                message: `Successfully loaded configuration from ${path.basename(filePath)}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: `Failed to load configuration: ${error.message}`
            };
        }
    }

    /**
     * Save an injectionator to a configuration file
     * @param {Injectionator} injectionator - The injectionator to save
     * @param {string} filePath - Path where to save the configuration
     * @returns {Promise<object>} Result object with success status
     */
    async saveToFile(injectionator, filePath) {
        try {
            await this.factory.saveToFile(injectionator, filePath);
            return {
                success: true,
                message: `Configuration saved to ${path.basename(filePath)}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: `Failed to save configuration: ${error.message}`
            };
        }
    }

    /**
     * List available configuration files in a directory
     * @param {string} [directory] - Directory to search (defaults to ./configs)
     * @returns {Promise<Array>} Array of configuration file information
     */
    async listConfigurations(directory = null) {
        const searchDir = directory || this.defaultConfigDir;
        
        try {
            const configurations = await this.factory.listConfigurations(searchDir);
            return {
                success: true,
                configurations: configurations,
                directory: searchDir
            };
        } catch (error) {
            return {
                success: false,
                configurations: [],
                error: error.message,
                directory: searchDir
            };
        }
    }

    /**
     * Validate a configuration file without loading it
     * @param {string} filePath - Path to the configuration file
     * @returns {Promise<object>} Validation result
     */
    async validateConfigurationFile(filePath) {
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return {
                    valid: false,
                    issues: [`Configuration file not found: ${filePath}`]
                };
            }

            // Try to parse JSON
            const content = fs.readFileSync(filePath, 'utf-8');
            let config;
            try {
                config = JSON.parse(content);
            } catch (parseError) {
                return {
                    valid: false,
                    issues: [`Invalid JSON: ${parseError.message}`]
                };
            }

            // Validate structure using factory validation
            try {
                this.factory._validateConfiguration(config);
                return {
                    valid: true,
                    issues: [],
                    config: config
                };
            } catch (validationError) {
                return {
                    valid: false,
                    issues: [validationError.message]
                };
            }

        } catch (error) {
            return {
                valid: false,
                issues: [`Validation error: ${error.message}`]
            };
        }
    }

    /**
     * Create an injectionator from a template
     * @param {string} templateName - Name of the template to use
     * @param {string} injectionatorName - Name for the new injectionator
     * @param {object} [options] - Additional options for customization
     * @returns {Promise<object>} Result object with injectionator or error
     */
    async createFromTemplate(templateName, injectionatorName, options = {}) {
        try {
            if (!this.templates.has(templateName)) {
                return {
                    success: false,
                    error: `Template '${templateName}' not found`,
                    availableTemplates: Array.from(this.templates.keys())
                };
            }

            const template = this.templates.get(templateName);
            const config = template.generator(injectionatorName, options);
            
            const injectionator = await this.factory.createFromConfig(config);
            
            return {
                success: true,
                injectionator: injectionator,
                template: templateName,
                message: `Created injectionator '${injectionatorName}' from template '${templateName}'`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: `Failed to create from template: ${error.message}`
            };
        }
    }

    /**
     * Create a blank injectionator with minimal configuration
     * @param {string} name - Name for the injectionator
     * @param {object} [options] - Additional options
     * @returns {Promise<object>} Result object with injectionator or error
     */
    async createBlank(name, options = {}) {
        return this.createFromTemplate('blank', name, options);
    }

    /**
     * Get available templates
     * @returns {Array} Array of template information
     */
    getAvailableTemplates() {
        return Array.from(this.templates.entries()).map(([name, template]) => ({
            name: name,
            description: template.description,
            category: template.category || 'General'
        }));
    }

    /**
     * Export configuration as formatted JSON string
     * @param {Injectionator} injectionator - The injectionator to export
     * @param {boolean} [pretty] - Whether to format with indentation
     * @returns {string} JSON string representation
     */
    exportConfiguration(injectionator, pretty = true) {
        try {
            const config = injectionator.toJSON();
            return pretty ? JSON.stringify(config, null, 2) : JSON.stringify(config);
        } catch (error) {
            throw new Error(`Failed to export configuration: ${error.message}`);
        }
    }

    /**
     * Import configuration from JSON string
     * @param {string} jsonString - JSON configuration string
     * @returns {Promise<object>} Result object with injectionator or error
     */
    async importFromString(jsonString) {
        try {
            const config = JSON.parse(jsonString);
            const injectionator = await this.factory.createFromConfig(config);
            
            return {
                success: true,
                injectionator: injectionator,
                message: 'Configuration imported successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: `Failed to import configuration: ${error.message}`
            };
        }
    }

    /**
     * Get configuration summary for display
     * @param {Injectionator} injectionator - The injectionator to summarize
     * @returns {object} Configuration summary
     */
    getConfigurationSummary(injectionator) {
        try {
            return {
                name: injectionator.name,
                description: injectionator.description || 'No description',
                sendChainMitigations: injectionator.sendChain?.mitigations?.length || 0,
                receiveChainMitigations: injectionator.receiveChain?.mitigations?.length || 0,
                backendType: injectionator.llmBackend?.type || 'Unknown',
                backendName: injectionator.llmBackend?.name || 'Unknown',
                injectionCount: Object.keys(injectionator.injections || {}).length,
                valid: injectionator.validate().valid
            };
        } catch (error) {
            return {
                name: 'Unknown',
                description: 'Error getting summary',
                error: error.message,
                valid: false
            };
        }
    }

    /**
     * Ensure default configuration directory exists
     * @returns {string} Path to the configuration directory
     */
    ensureConfigDirectory() {
        if (!fs.existsSync(this.defaultConfigDir)) {
            fs.mkdirSync(this.defaultConfigDir, { recursive: true });
        }
        return this.defaultConfigDir;
    }

    /**
     * Get suggested file path for saving a configuration
     * @param {Injectionator} injectionator - The injectionator to save
     * @param {string} [extension] - File extension (default: .json)
     * @returns {string} Suggested file path
     */
    getSuggestedFilePath(injectionator, extension = '.json') {
        this.ensureConfigDirectory();
        
        // Create a safe filename from the injectionator name
        const safeName = injectionator.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        let fileName = `${safeName}${extension}`;
        let counter = 1;
        let filePath = path.join(this.defaultConfigDir, fileName);

        // If file exists, add a counter
        while (fs.existsSync(filePath)) {
            fileName = `${safeName}-${counter}${extension}`;
            filePath = path.join(this.defaultConfigDir, fileName);
            counter++;
        }

        return filePath;
    }

    /**
     * Initialize built-in templates
     * @private
     */
    _initializeTemplates() {
        // Blank template
        this.templates.set('blank', {
            description: 'Minimal configuration with basic security',
            category: 'Basic',
            generator: (name, options) => ({
                name: name,
                description: options.description || 'Created from blank template',
                sourceUrl: options.sourceUrl || null,
                sendChain: {
                    name: 'Basic Send Chain',
                    description: 'Basic prompt validation',
                    sourceUrl: null,
                    mitigations: []
                },
                receiveChain: {
                    name: 'Basic Receive Chain', 
                    description: 'Basic response filtering',
                    sourceUrl: null,
                    outputTarget: 'user',
                    mitigations: []
                },
                backend: {
                    name: 'Mock Backend',
                    type: 'llm',
                    provider: 'mockup',
                    model: 'mock-gpt-4',
                    apiKey: null
                },
                injections: {}
            })
        });

        // Security-focused template
        this.templates.set('security', {
            description: 'Pre-configured with common security mitigations',
            category: 'Security',
            generator: (name, options) => this.factory.createTemplate(name, {
                description: options.description || 'Security-focused configuration with injection detection',
                sourceUrl: options.sourceUrl
            })
        });

        // Testing template
        this.templates.set('testing', {
            description: 'Optimized for testing various injection scenarios',
            category: 'Testing',
            generator: (name, options) => ({
                name: name,
                description: options.description || 'Testing configuration with comprehensive injection patterns',
                sourceUrl: options.sourceUrl || null,
                sendChain: {
                    name: 'Comprehensive Testing Chain',
                    description: 'Tests multiple injection patterns',
                    sourceUrl: null,
                    mitigations: [
                        {
                            name: 'Role Play Detection',
                            description: 'Detects role-playing attempts',
                            injection: 'role-play-detection'
                        },
                        {
                            name: 'System Prompt Extraction',
                            description: 'Detects system prompt extraction attempts',
                            injection: 'system-prompt-extraction'
                        },
                        {
                            name: 'Instruction Override',
                            description: 'Detects instruction override attempts',
                            injection: 'instruction-override'
                        }
                    ]
                },
                receiveChain: {
                    name: 'Response Analysis Chain',
                    description: 'Analyzes responses for leaked information',
                    sourceUrl: null,
                    outputTarget: 'user',
                    mitigations: [
                        {
                            name: 'Sensitive Data Filter',
                            description: 'Filters potentially sensitive data',
                            injection: 'sensitive-data-filter'
                        }
                    ]
                },
                backend: {
                    name: 'Test LLM Backend',
                    type: 'llm',
                    provider: 'mockup',
                    model: 'mock-gpt-4',
                    apiKey: null
                },
                injections: {
                    'role-play-detection': {
                        name: 'role-play-detection',
                        type: 'Role Play Detection',
                        description: 'Detects attempts to make LLM roleplay as specific characters',
                        patterns: [
                            { type: 'string', value: 'act as' },
                            { type: 'string', value: 'pretend to be' },
                            { type: 'string', value: 'simulate' },
                            { type: 'regex', source: 'you are (now )?a', flags: 'gi' }
                        ]
                    },
                    'system-prompt-extraction': {
                        name: 'system-prompt-extraction',
                        type: 'System Prompt Extraction',
                        description: 'Detects attempts to reveal system prompts',
                        patterns: [
                            { type: 'string', value: 'system prompt' },
                            { type: 'string', value: 'initial instructions' },
                            { type: 'regex', source: 'show.*instructions', flags: 'gi' },
                            { type: 'regex', source: 'reveal.*prompt', flags: 'gi' }
                        ]
                    },
                    'instruction-override': {
                        name: 'instruction-override',
                        type: 'Instruction Override',
                        description: 'Detects attempts to override previous instructions',
                        patterns: [
                            { type: 'string', value: 'ignore previous instructions' },
                            { type: 'string', value: 'forget everything' },
                            { type: 'string', value: 'new instructions' },
                            { type: 'regex', source: 'instead.*do', flags: 'gi' }
                        ]
                    },
                    'sensitive-data-filter': {
                        name: 'sensitive-data-filter',
                        type: 'Sensitive Data Filter',
                        description: 'Filters potentially sensitive information from responses',
                        patterns: [
                            { type: 'regex', source: 'api[_-]?key', flags: 'gi' },
                            { type: 'regex', source: 'password', flags: 'gi' },
                            { type: 'regex', source: 'token', flags: 'gi' },
                            { type: 'regex', source: '\\b\\d{3}-\\d{2}-\\d{4}\\b', flags: 'g' } // SSN pattern
                        ]
                    }
                }
            })
        });
    }
}
