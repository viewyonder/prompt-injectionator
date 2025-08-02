import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { InjectionatorFactory, injectionatorFactory } from '../../src/core/InjectionatorFactory.js';
import { Injectionator } from '../../src/core/Injectionator.js';

// Mock crypto.randomUUID for ES modules
global.crypto = {
    randomUUID: () => 'factory-test-uuid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('InjectionatorFactory', () => {
    let factory;
    let tempDir;
    let validConfig;

    beforeEach(() => {
        factory = new InjectionatorFactory();
        tempDir = path.join(__dirname, 'temp-factory-test');
        
        // Create temp directory for tests
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Valid test configuration
        validConfig = {
            name: 'Test Injectionator',
            description: 'Test configuration for factory testing',
            sourceUrl: null,
            sendChain: {
                name: 'Test Send Chain',
                description: 'Test send chain',
                sourceUrl: null,
                mitigations: [
                    {
                        name: 'Test Mitigation',
                        description: 'Test mitigation',
                        injection: 'test-injection'
                    }
                ]
            },
            receiveChain: {
                name: 'Test Receive Chain',
                description: 'Test receive chain',
                sourceUrl: null,
                outputTarget: 'user',
                mitigations: []
            },
            backend: {
                name: 'Test Backend',
                type: 'llm',
                provider: 'mockup',
                model: 'test-model'
            },
            injections: {
                'test-injection': {
                    name: 'test-injection',
                    type: 'Test Injection',
                    description: 'Test injection for testing',
                    patterns: [
                        {
                            type: 'string',
                            value: 'test pattern'
                        }
                    ]
                }
            }
        };
    });

    afterEach(() => {
        // Clean up temp directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('Constructor', () => {
        test('should create factory instance', () => {
            const factory = new InjectionatorFactory();
            expect(factory).toBeInstanceOf(InjectionatorFactory);
            expect(factory.logger).toBeDefined();
        });

        test('should provide default factory instance', () => {
            expect(injectionatorFactory).toBeInstanceOf(InjectionatorFactory);
        });
    });

    describe('createFromConfig', () => {
        test('should create Injectionator from valid configuration', async () => {
            const injectionator = await factory.createFromConfig(validConfig);
            
            expect(injectionator).toBeInstanceOf(Injectionator);
            expect(injectionator.name).toBe('Test Injectionator');
            expect(injectionator.description).toBe('Test configuration for factory testing');
        });

        test('should validate Injectionator after creation', async () => {
            const injectionator = await factory.createFromConfig(validConfig);
            const validation = injectionator.validate();
            
            expect(validation.valid).toBe(true);
            expect(validation.issues).toHaveLength(0);
        });

        test('should throw error for missing required fields', async () => {
            const invalidConfig = {
                name: 'Incomplete Config'
                // Missing sendChain, receiveChain, backend, injections
            };

            await expect(factory.createFromConfig(invalidConfig))
                .rejects.toThrow('Missing required configuration fields');
        });

        test('should throw error for invalid sendChain structure', async () => {
            const invalidConfig = {
                ...validConfig,
                sendChain: {
                    // Missing name and mitigations array
                    description: 'Invalid chain'
                }
            };

            await expect(factory.createFromConfig(invalidConfig))
                .rejects.toThrow('sendChain must have a name and mitigations array');
        });

        test('should throw error for invalid receiveChain structure', async () => {
            const invalidConfig = {
                ...validConfig,
                receiveChain: {
                    // Missing name and mitigations array
                    description: 'Invalid chain'
                }
            };

            await expect(factory.createFromConfig(invalidConfig))
                .rejects.toThrow('receiveChain must have a name and mitigations array');
        });

        test('should throw error for invalid backend structure', async () => {
            const invalidConfig = {
                ...validConfig,
                backend: {
                    // Missing name and type
                    provider: 'test'
                }
            };

            await expect(factory.createFromConfig(invalidConfig))
                .rejects.toThrow('backend must have a name and type');
        });

        test('should throw error for missing injection reference', async () => {
            const invalidConfig = {
                ...validConfig,
                sendChain: {
                    ...validConfig.sendChain,
                    mitigations: [
                        {
                            name: 'Test Mitigation',
                            description: 'Test',
                            injection: 'non-existent-injection'
                        }
                    ]
                }
            };

            await expect(factory.createFromConfig(invalidConfig))
                .rejects.toThrow("Mitigation 'Test Mitigation' references unknown injection 'non-existent-injection'");
        });
    });

    describe('createFromFile', () => {
        test('should create Injectionator from valid JSON file', async () => {
            const configFile = path.join(tempDir, 'valid-config.json');
            fs.writeFileSync(configFile, JSON.stringify(validConfig, null, 2));

            const injectionator = await factory.createFromFile(configFile);
            
            expect(injectionator).toBeInstanceOf(Injectionator);
            expect(injectionator.name).toBe('Test Injectionator');
        });

        test('should throw error for non-existent file', async () => {
            const nonExistentFile = path.join(tempDir, 'non-existent.json');

            await expect(factory.createFromFile(nonExistentFile))
                .rejects.toThrow('Configuration file not found');
        });

        test('should throw error for invalid JSON', async () => {
            const invalidJsonFile = path.join(tempDir, 'invalid.json');
            fs.writeFileSync(invalidJsonFile, '{ invalid json }');

            await expect(factory.createFromFile(invalidJsonFile))
                .rejects.toThrow('Invalid JSON in configuration file');
        });

        test('should throw error for valid JSON but invalid configuration', async () => {
            const invalidConfigFile = path.join(tempDir, 'invalid-config.json');
            fs.writeFileSync(invalidConfigFile, JSON.stringify({ name: 'Incomplete' }, null, 2));

            await expect(factory.createFromFile(invalidConfigFile))
                .rejects.toThrow('Missing required configuration fields');
        });
    });

    describe('createFromDirectory', () => {
        test('should create multiple Injectionators from directory', async () => {
            // Create multiple config files
            const config1 = { ...validConfig, name: 'Injectionator 1' };
            const config2 = { ...validConfig, name: 'Injectionator 2' };
            
            fs.writeFileSync(path.join(tempDir, 'config1.json'), JSON.stringify(config1, null, 2));
            fs.writeFileSync(path.join(tempDir, 'config2.json'), JSON.stringify(config2, null, 2));

            const injectionators = await factory.createFromDirectory(tempDir);
            
            expect(injectionators.size).toBe(2);
            expect(injectionators.get('config1')).toBeInstanceOf(Injectionator);
            expect(injectionators.get('config2')).toBeInstanceOf(Injectionator);
            expect(injectionators.get('config1').name).toBe('Injectionator 1');
            expect(injectionators.get('config2').name).toBe('Injectionator 2');
        });

        test('should handle directory with no JSON files', async () => {
            // Create a file that's not JSON
            fs.writeFileSync(path.join(tempDir, 'not-json.txt'), 'This is not JSON');

            const injectionators = await factory.createFromDirectory(tempDir);
            
            expect(injectionators.size).toBe(0);
        });

        test('should handle mixed valid and invalid configurations', async () => {
            // Create valid and invalid configs
            const validConfig1 = { ...validConfig, name: 'Valid Config' };
            const invalidConfig1 = { name: 'Invalid Config' }; // Missing required fields
            
            fs.writeFileSync(path.join(tempDir, 'valid.json'), JSON.stringify(validConfig1, null, 2));
            fs.writeFileSync(path.join(tempDir, 'invalid.json'), JSON.stringify(invalidConfig1, null, 2));

            const injectionators = await factory.createFromDirectory(tempDir);
            
            expect(injectionators.size).toBe(2); // 1 valid injectionator + 1 errors entry
            expect(injectionators.get('valid')).toBeInstanceOf(Injectionator);
            expect(injectionators.has('_errors')).toBe(true);
            
            const errors = injectionators.get('_errors');
            expect(errors).toHaveLength(1);
            expect(errors[0].file).toBe('invalid.json');
        });

        test('should throw error for non-existent directory', async () => {
            const nonExistentDir = path.join(tempDir, 'non-existent');

            await expect(factory.createFromDirectory(nonExistentDir))
                .rejects.toThrow('Configuration directory not found');
        });
    });

    describe('saveToFile', () => {
        test('should save Injectionator to JSON file', async () => {
            const injectionator = await factory.createFromConfig(validConfig);
            const outputFile = path.join(tempDir, 'saved-config.json');

            await factory.saveToFile(injectionator, outputFile);
            
            expect(fs.existsSync(outputFile)).toBe(true);
            
            // Verify the saved content can be loaded back
            const reloadedInjectionator = await factory.createFromFile(outputFile);
            expect(reloadedInjectionator.name).toBe(injectionator.name);
        });

        test('should create directory if it does not exist', async () => {
            const injectionator = await factory.createFromConfig(validConfig);
            const nestedDir = path.join(tempDir, 'nested', 'dir');
            const outputFile = path.join(nestedDir, 'config.json');

            await factory.saveToFile(injectionator, outputFile);
            
            expect(fs.existsSync(outputFile)).toBe(true);
        });

        test('should throw error for invalid injectionator instance', async () => {
            const invalidInjectionator = { name: 'Not an Injectionator' };
            const outputFile = path.join(tempDir, 'invalid.json');

            await expect(factory.saveToFile(invalidInjectionator, outputFile))
                .rejects.toThrow('Invalid injectionator instance provided');
        });
    });

    describe('listConfigurations', () => {
        test('should list configuration files with metadata', async () => {
            // Create test configuration files
            const config1 = { ...validConfig, name: 'Config 1', description: 'First config' };
            const config2 = { ...validConfig, name: 'Config 2', description: 'Second config' };
            
            fs.writeFileSync(path.join(tempDir, 'config1.json'), JSON.stringify(config1, null, 2));
            fs.writeFileSync(path.join(tempDir, 'config2.json'), JSON.stringify(config2, null, 2));

            const configs = await factory.listConfigurations(tempDir);
            
            expect(configs).toHaveLength(2);
            
            const config1Info = configs.find(c => c.filename === 'config1.json');
            expect(config1Info).toBeDefined();
            expect(config1Info.name).toBe('Config 1');
            expect(config1Info.description).toBe('First config');
            expect(config1Info.valid).toBe(true);
            expect(config1Info.size).toBeGreaterThan(0);
            expect(config1Info.modified).toBeInstanceOf(Date);
        });

        test('should handle invalid JSON files', async () => {
            fs.writeFileSync(path.join(tempDir, 'invalid.json'), '{ invalid json }');

            const configs = await factory.listConfigurations(tempDir);
            
            expect(configs).toHaveLength(1);
            expect(configs[0].filename).toBe('invalid.json');
            expect(configs[0].valid).toBe(false);
            expect(configs[0].error).toBeDefined();
        });

        test('should handle non-existent directory', async () => {
            const nonExistentDir = path.join(tempDir, 'non-existent');
            
            const configs = await factory.listConfigurations(nonExistentDir);
            
            expect(configs).toHaveLength(0);
        });
    });

    describe('createTemplate', () => {
        test('should create template with default values', () => {
            const template = factory.createTemplate('My Bot');
            
            expect(template.name).toBe('My Bot');
            expect(template.description).toBe('Created from template');
            expect(template.sourceUrl).toBe(null);
            expect(template.sendChain).toBeDefined();
            expect(template.receiveChain).toBeDefined();
            expect(template.backend).toBeDefined();
            expect(template.injections).toBeDefined();
        });

        test('should create template with custom options', () => {
            const options = {
                description: 'Custom description',
                sourceUrl: 'https://github.com/example/repo'
            };
            
            const template = factory.createTemplate('Custom Bot', options);
            
            expect(template.name).toBe('Custom Bot');
            expect(template.description).toBe('Custom description');
            expect(template.sourceUrl).toBe('https://github.com/example/repo');
        });

        test('should create valid configuration that can be used', async () => {
            const template = factory.createTemplate('Template Bot');
            
            // Should be able to create an injectionator from the template
            const injectionator = await factory.createFromConfig(template);
            
            expect(injectionator).toBeInstanceOf(Injectionator);
            expect(injectionator.name).toBe('Template Bot');
        });
    });

    describe('Integration Tests', () => {
        test('should handle complete workflow: create -> save -> load -> execute', async () => {
            // Create injectionator from config
            const originalInjectionator = await factory.createFromConfig(validConfig);
            
            // Save to file
            const configFile = path.join(tempDir, 'workflow-test.json');
            await factory.saveToFile(originalInjectionator, configFile);
            
            // Load from file
            const reloadedInjectionator = await factory.createFromFile(configFile);
            
            // Execute with both injectionators
            const testPrompt = 'Test prompt for workflow';
            const originalResult = await originalInjectionator.execute(testPrompt);
            const reloadedResult = await reloadedInjectionator.execute(testPrompt);
            
            // Results should be equivalent
            expect(originalResult.success).toBe(reloadedResult.success);
            expect(originalResult.finalResponse).toBe(reloadedResult.finalResponse);
        });

        test('should handle template workflow: create template -> save -> load -> customize -> execute', async () => {
            // Create template
            const template = factory.createTemplate('Workflow Template', {
                description: 'Template for workflow testing'
            });
            
            // Save template
            const templateFile = path.join(tempDir, 'template.json');
            fs.writeFileSync(templateFile, JSON.stringify(template, null, 2));
            
            // Load and customize template
            const loadedTemplate = JSON.parse(fs.readFileSync(templateFile, 'utf-8'));
            loadedTemplate.name = 'Customized Template Bot';
            loadedTemplate.description = 'Customized from template';
            
            // Create injectionator from customized template
            const injectionator = await factory.createFromConfig(loadedTemplate);
            
            expect(injectionator.name).toBe('Customized Template Bot');
            expect(injectionator.description).toBe('Customized from template');
            
            // Should be able to execute
            const result = await injectionator.execute('Test prompt');
            expect(result).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        test('should provide descriptive error messages for validation failures', async () => {
            const configs = [
                { 
                    config: {},
                    expectedError: 'Missing required configuration fields: name, sendChain, receiveChain, backend, injections'
                },
                {
                    config: { name: 'Test', sendChain: {}, receiveChain: {}, backend: {}, injections: {} },
                    expectedError: 'sendChain must have a name and mitigations array'
                }
            ];

            for (const { config, expectedError } of configs) {
                await expect(factory.createFromConfig(config))
                    .rejects.toThrow(expectedError);
            }
        });

        test('should handle file system errors gracefully', async () => {
            // Test saving to read-only location (if possible)
            const injectionator = await factory.createFromConfig(validConfig);
            const readOnlyFile = '/root/readonly.json'; // This should fail on most systems
            
            await expect(factory.saveToFile(injectionator, readOnlyFile))
                .rejects.toThrow();
        });
    });

    describe('Default Factory Instance', () => {
        test('should work with default factory instance', async () => {
            const injectionator = await injectionatorFactory.createFromConfig(validConfig);
            
            expect(injectionator).toBeInstanceOf(Injectionator);
            expect(injectionator.name).toBe('Test Injectionator');
        });

        test('should create template with default instance', () => {
            const template = injectionatorFactory.createTemplate('Default Factory Test');
            
            expect(template.name).toBe('Default Factory Test');
            expect(template.sendChain).toBeDefined();
        });
    });
});
