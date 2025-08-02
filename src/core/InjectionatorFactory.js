import fs from 'fs';
import path from 'path';
import { Injectionator } from './Injectionator.js';
import logger from './Logger.js';

/**
 * Factory class for creating Injectionator instances from JSON configuration files.
 * Provides a clean interface for users to load and create Injectionator objects
 * from JSON configuration with proper validation and error handling.
 */
export class InjectionatorFactory {
    constructor() {
        this.logger = logger.withContext('InjectionatorFactory');
    }

    /**
     * Create an Injectionator instance from a JSON configuration file
     * @param {string} configFilePath - Path to the JSON configuration file
     * @returns {Promise<Injectionator>} - Configured Injectionator instance ready to execute
     * @throws {Error} - If configuration file is invalid or missing required components
     */
    async createFromFile(configFilePath) {
        this.logger.info('Creating Injectionator from configuration file', {
            configFile: configFilePath,
            event: 'factory_create_from_file'
        });

        try {
            // Validate file existence
            if (!fs.existsSync(configFilePath)) {
                throw new Error(`Configuration file not found: ${configFilePath}`);
            }

            // Read and parse JSON configuration
            const configContent = fs.readFileSync(configFilePath, 'utf-8');
            let config;
            
            try {
                config = JSON.parse(configContent);
            } catch (parseError) {
                throw new Error(`Invalid JSON in configuration file: ${parseError.message}`);
            }

            // Create Injectionator from parsed configuration
            const injectionator = await this.createFromConfig(config, configFilePath);
            
            this.logger.info('Injectionator created successfully from file', {
                configFile: configFilePath,
                injectionatorName: injectionator.name,
                injectionatorId: injectionator.id,
                event: 'factory_create_success'
            });

            return injectionator;

        } catch (error) {
            this.logger.error('Failed to create Injectionator from file', {
                configFile: configFilePath,
                error: error.message,
                event: 'factory_create_error'
            });
            throw error;
        }
    }

    /**
     * Create an Injectionator instance from a JSON configuration object
     * @param {object} config - JSON configuration object
     * @param {string} [sourceFile] - Optional source file path for logging
     * @returns {Promise<Injectionator>} - Configured Injectionator instance ready to execute
     * @throws {Error} - If configuration is invalid or missing required components
     */
    async createFromConfig(config, sourceFile = null) {
        this.logger.info('Creating Injectionator from configuration object', {
            configName: config.name || 'Unnamed',
            sourceFile: sourceFile,
            event: 'factory_create_from_config'
        });

        try {
            // Validate configuration structure
            this._validateConfiguration(config);

            // Use the existing Injectionator.fromJSON method
            const injectionator = Injectionator.fromJSON(config);

            // Validate the created injectionator
            const validation = injectionator.validate();
            if (!validation.valid) {
                throw new Error(`Injectionator validation failed: ${validation.issues.join(', ')}`);
            }

            this.logger.info('Injectionator created and validated successfully', {
                injectionatorName: injectionator.name,
                injectionatorId: injectionator.id,
                event: 'factory_create_validated'
            });

            return injectionator;

        } catch (error) {
            this.logger.error('Failed to create Injectionator from configuration', {
                configName: config?.name || 'Unknown',
                error: error.message,
                event: 'factory_config_error'
            });
            throw error;
        }
    }

    /**
     * Create multiple Injectionator instances from a directory of JSON configuration files
     * @param {string} configDirectory - Path to directory containing JSON configuration files
     * @param {string} [filePattern] - Optional glob pattern for file matching (default: "*.json")
     * @returns {Promise<Map<string, Injectionator>>} - Map of filename to Injectionator instances
     */
    async createFromDirectory(configDirectory, filePattern = '*.json') {
        this.logger.info('Creating Injectionators from directory', {
            directory: configDirectory,
            pattern: filePattern,
            event: 'factory_create_from_directory'
        });

        const injectionators = new Map();
        const errors = [];

        try {
            // Validate directory existence
            if (!fs.existsSync(configDirectory)) {
                throw new Error(`Configuration directory not found: ${configDirectory}`);
            }

            // Read directory contents
            const files = fs.readdirSync(configDirectory);
            const jsonFiles = files.filter(file => file.endsWith('.json'));

            if (jsonFiles.length === 0) {
                this.logger.warn('No JSON configuration files found in directory', {
                    directory: configDirectory,
                    event: 'factory_no_configs_found'
                });
                return injectionators;
            }

            // Process each configuration file
            for (const file of jsonFiles) {
                const filePath = path.join(configDirectory, file);
                const fileName = path.basename(file, '.json');

                try {
                    const injectionator = await this.createFromFile(filePath);
                    injectionators.set(fileName, injectionator);
                } catch (error) {
                    errors.push({
                        file: file,
                        error: error.message
                    });
                    this.logger.warn('Failed to create Injectionator from file', {
                        file: file,
                        error: error.message,
                        event: 'factory_file_error'
                    });
                }
            }

            this.logger.info('Batch creation completed', {
                directory: configDirectory,
                successCount: injectionators.size,
                errorCount: errors.length,
                event: 'factory_batch_complete'
            });

            // If there were errors, include them in the result for user awareness
            if (errors.length > 0) {
                injectionators.set('_errors', errors);
            }

            return injectionators;

        } catch (error) {
            this.logger.error('Failed to create Injectionators from directory', {
                directory: configDirectory,
                error: error.message,
                event: 'factory_directory_error'
            });
            throw error;
        }
    }

    /**
     * Save an Injectionator instance to a JSON configuration file
     * @param {Injectionator} injectionator - The Injectionator instance to save
     * @param {string} configFilePath - Path where to save the configuration file
     * @returns {Promise<void>}
     * @throws {Error} - If file cannot be written or injectionator is invalid
     */
    async saveToFile(injectionator, configFilePath) {
        this.logger.info('Saving Injectionator to configuration file', {
            injectionatorName: injectionator.name,
            configFile: configFilePath,
            event: 'factory_save_to_file'
        });

        try {
            // Validate injectionator
            if (!(injectionator instanceof Injectionator)) {
                throw new Error('Invalid injectionator instance provided');
            }

            // Convert to JSON
            const config = injectionator.toJSON();

            // Ensure directory exists
            const dir = path.dirname(configFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Write configuration file
            fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf-8');

            this.logger.info('Injectionator configuration saved successfully', {
                injectionatorName: injectionator.name,
                configFile: configFilePath,
                event: 'factory_save_success'
            });

        } catch (error) {
            this.logger.error('Failed to save Injectionator configuration', {
                injectionatorName: injectionator?.name || 'Unknown',
                configFile: configFilePath,
                error: error.message,
                event: 'factory_save_error'
            });
            throw error;
        }
    }

    /**
     * List available configuration files in a directory
     * @param {string} configDirectory - Path to directory containing JSON configuration files
     * @returns {Promise<Array<object>>} - Array of configuration file info objects
     */
    async listConfigurations(configDirectory) {
        this.logger.info('Listing available configurations', {
            directory: configDirectory,
            event: 'factory_list_configs'
        });

        try {
            if (!fs.existsSync(configDirectory)) {
                return [];
            }

            const files = fs.readdirSync(configDirectory);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            const configurations = [];

            for (const file of jsonFiles) {
                const filePath = path.join(configDirectory, file);
                const stats = fs.statSync(filePath);
                
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const config = JSON.parse(content);
                    
                    configurations.push({
                        filename: file,
                        name: config.name || path.basename(file, '.json'),
                        description: config.description || 'No description available',
                        filePath: filePath,
                        size: stats.size,
                        modified: stats.mtime,
                        valid: true
                    });
                } catch (error) {
                    configurations.push({
                        filename: file,
                        name: path.basename(file, '.json'),
                        description: 'Invalid configuration file',
                        filePath: filePath,
                        size: stats.size,
                        modified: stats.mtime,
                        valid: false,
                        error: error.message
                    });
                }
            }

            return configurations;

        } catch (error) {
            this.logger.error('Failed to list configurations', {
                directory: configDirectory,
                error: error.message,
                event: 'factory_list_error'
            });
            throw error;
        }
    }

    /**
     * Validate a JSON configuration object structure
     * @param {object} config - Configuration object to validate
     * @throws {Error} - If configuration is invalid
     * @private
     */
    _validateConfiguration(config) {
        const required = ['name', 'sendChain', 'receiveChain', 'backend', 'injections'];
        const missing = required.filter(field => !config[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required configuration fields: ${missing.join(', ')}`);
        }

        // Validate sendChain structure
        if (!config.sendChain.name || !Array.isArray(config.sendChain.mitigations)) {
            throw new Error('sendChain must have a name and mitigations array');
        }

        // Validate receiveChain structure
        if (!config.receiveChain.name || !Array.isArray(config.receiveChain.mitigations)) {
            throw new Error('receiveChain must have a name and mitigations array');
        }

        // Validate backend structure
        if (!config.backend.name || !config.backend.type) {
            throw new Error('backend must have a name and type');
        }

        // Validate injections structure
        if (typeof config.injections !== 'object') {
            throw new Error('injections must be an object mapping injection names to configurations');
        }

        // Validate that all referenced injections exist
        const allMitigations = [...config.sendChain.mitigations, ...config.receiveChain.mitigations];
        for (const mitigation of allMitigations) {
            if (mitigation.injection && !config.injections[mitigation.injection]) {
                throw new Error(`Mitigation '${mitigation.name}' references unknown injection '${mitigation.injection}'`);
            }
        }
    }

    /**
     * Create a template configuration object that users can modify
     * @param {string} name - Name for the Injectionator
     * @param {object} [options] - Optional configuration options
     * @returns {object} - Template configuration object
     */
    createTemplate(name, options = {}) {
        const template = {
            name: name || 'My Injectionator',
            description: options.description || 'Created from template',
            sourceUrl: options.sourceUrl || null,
            sendChain: {
                name: 'Send Security Chain',
                description: 'Validates user prompts before sending to backend',
                sourceUrl: null,
                mitigations: [
                    {
                        name: 'Basic Security Check',
                        description: 'Detects common prompt injection patterns',
                        injection: 'basic-injection-detection'
                    }
                ]
            },
            receiveChain: {
                name: 'Receive Filter Chain',
                description: 'Filters backend responses before returning to user',
                sourceUrl: null,
                outputTarget: 'user',
                mitigations: [
                    {
                        name: 'Response Sanitization',
                        description: 'Removes potentially harmful content from responses',
                        injection: 'response-sanitization'
                    }
                ]
            },
            backend: {
                name: 'Default LLM Backend',
                type: 'llm',
                provider: 'mockup',
                model: 'mock-gpt-4',
                apiKey: null
            },
            injections: {
                'basic-injection-detection': {
                    name: 'basic-injection-detection',
                    type: 'Basic Injection Detection',
                    description: 'Detects common prompt injection patterns',
                    patterns: [
                        {
                            type: 'string',
                            value: 'ignore previous instructions'
                        },
                        {
                            type: 'regex',
                            source: 'system.*prompt',
                            flags: 'gi'
                        }
                    ]
                },
                'response-sanitization': {
                    name: 'response-sanitization',
                    type: 'Response Sanitization',
                    description: 'Removes potentially sensitive information from responses',
                    patterns: [
                        {
                            type: 'regex',
                            source: 'api[_-]?key',
                            flags: 'gi'
                        }
                    ]
                }
            }
        };

        return template;
    }
}

// Export both the class and a default instance for convenience
export const injectionatorFactory = new InjectionatorFactory();
export default InjectionatorFactory;
