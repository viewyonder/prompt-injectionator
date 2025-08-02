import { ApiKeyManager } from '../../src/core/ApiKeyManager';

describe('ApiKeyManager', () => {
    let apiKeyManager;

    beforeEach(() => {
        apiKeyManager = new ApiKeyManager();
        // Clear environment variables for testing
        delete process.env.TEST_API_KEY;
        delete process.env.ANOTHER_KEY;
    });

    afterEach(() => {
        apiKeyManager.clearRuntimeKeys();
        // Clean up environment variables
        delete process.env.TEST_API_KEY;
        delete process.env.ANOTHER_KEY;
    });

    describe('Runtime Key Management', () => {
        test('should add and retrieve runtime keys', () => {
            apiKeyManager.addRuntimeKey('TEST_KEY', 'test-value-123');
            
            const resolvedKey = apiKeyManager.resolveKey('TEST_KEY');
            expect(resolvedKey).toBe('test-value-123');
        });

        test('should throw error for invalid runtime key parameters', () => {
            expect(() => {
                apiKeyManager.addRuntimeKey(null, 'value');
            }).toThrow('Both keyName and keyValue are required');

            expect(() => {
                apiKeyManager.addRuntimeKey('key', null);
            }).toThrow('Both keyName and keyValue are required');
        });

        test('should clear runtime keys', () => {
            apiKeyManager.addRuntimeKey('TEST_KEY', 'test-value-123');
            expect(apiKeyManager.resolveKey('TEST_KEY')).toBe('test-value-123');

            apiKeyManager.clearRuntimeKeys();
            expect(apiKeyManager.resolveKey('TEST_KEY')).toBeNull();
        });
    });

    describe('Environment Variable Resolution', () => {
        test('should resolve keys from environment variables', () => {
            process.env.TEST_API_KEY = 'env-value-456';
            
            const resolvedKey = apiKeyManager.resolveKey('TEST_API_KEY');
            expect(resolvedKey).toBe('env-value-456');
        });

        test('should return null for non-existent environment variables', () => {
            const resolvedKey = apiKeyManager.resolveKey('NON_EXISTENT_KEY');
            expect(resolvedKey).toBeNull();
        });
    });

    describe('Key Resolution Priority', () => {
        test('should prioritize runtime keys over environment variables', () => {
            process.env.TEST_API_KEY = 'env-value';
            apiKeyManager.addRuntimeKey('TEST_API_KEY', 'runtime-value');
            
            const resolvedKey = apiKeyManager.resolveKey('TEST_API_KEY');
            expect(resolvedKey).toBe('runtime-value');
        });
    });

    describe('CLI Argument Parsing', () => {
        test('should parse single API key from CLI arguments', () => {
            const args = ['node', 'script.js', '--api-key', 'TEST_KEY=test-value-789'];
            
            const keyCount = apiKeyManager.parseCliArguments(args);
            expect(keyCount).toBe(1);
            expect(apiKeyManager.resolveKey('TEST_KEY')).toBe('test-value-789');
        });

        test('should parse multiple API keys from CLI arguments', () => {
            const args = [
                'node', 'script.js',
                '--api-key', 'FIRST_KEY=first-value',
                '--api-key', 'SECOND_KEY=second-value'
            ];
            
            const keyCount = apiKeyManager.parseCliArguments(args);
            expect(keyCount).toBe(2);
            expect(apiKeyManager.resolveKey('FIRST_KEY')).toBe('first-value');
            expect(apiKeyManager.resolveKey('SECOND_KEY')).toBe('second-value');
        });

        test('should handle API keys with equals signs in value', () => {
            const args = ['node', 'script.js', '--api-key', 'COMPLEX_KEY=value=with=equals'];
            
            const keyCount = apiKeyManager.parseCliArguments(args);
            expect(keyCount).toBe(1);
            expect(apiKeyManager.resolveKey('COMPLEX_KEY')).toBe('value=with=equals');
        });

        test('should ignore malformed API key arguments', () => {
            const args = [
                'node', 'script.js',
                '--api-key', 'VALID_KEY=valid-value',
                '--api-key', 'INVALID_FORMAT',  // Missing equals
                '--api-key', '=missing-key-name'  // Missing key name
            ];
            
            const keyCount = apiKeyManager.parseCliArguments(args);
            expect(keyCount).toBe(1);
            expect(apiKeyManager.resolveKey('VALID_KEY')).toBe('valid-value');
            expect(apiKeyManager.resolveKey('INVALID_FORMAT')).toBeNull();
        });
    });

    describe('Key Validation', () => {
        test('should validate available keys correctly', () => {
            process.env.ENV_KEY = 'env-value';
            apiKeyManager.addRuntimeKey('RUNTIME_KEY', 'runtime-value');
            
            const validation = apiKeyManager.validateKeys(['ENV_KEY', 'RUNTIME_KEY']);
            
            expect(validation.valid).toBe(true);
            expect(validation.available).toEqual(['ENV_KEY', 'RUNTIME_KEY']);
            expect(validation.missing).toEqual([]);
            expect(validation.message).toBe('All required API keys are available');
        });

        test('should identify missing keys', () => {
            apiKeyManager.addRuntimeKey('AVAILABLE_KEY', 'value');
            
            const validation = apiKeyManager.validateKeys(['AVAILABLE_KEY', 'MISSING_KEY']);
            
            expect(validation.valid).toBe(false);
            expect(validation.available).toEqual(['AVAILABLE_KEY']);
            expect(validation.missing).toEqual(['MISSING_KEY']);
            expect(validation.message).toBe('Missing API keys: MISSING_KEY');
        });

        test('should handle empty required keys list', () => {
            const validation = apiKeyManager.validateKeys([]);
            
            expect(validation.valid).toBe(true);
            expect(validation.available).toEqual([]);
            expect(validation.missing).toEqual([]);
        });
    });

    describe('Usage Instructions', () => {
        test('should generate usage instructions for required keys', () => {
            const requiredKeys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'];
            const instructions = apiKeyManager.getUsageInstructions(requiredKeys);
            
            expect(instructions).toContain('OPENAI_API_KEY');
            expect(instructions).toContain('ANTHROPIC_API_KEY');
            expect(instructions).toContain('Environment Variables');
            expect(instructions).toContain('Command Line Arguments');
            expect(instructions).toContain('Security Notes');
        });
    });

    describe('Statistics', () => {
        test('should return key statistics without exposing values', () => {
            process.env.TEST_API_KEY = 'env-value';
            process.env.ANOTHER_TOKEN = 'another-value';
            apiKeyManager.addRuntimeKey('RUNTIME_KEY', 'runtime-value');
            
            const stats = apiKeyManager.getKeyStats();
            
            expect(stats.runtimeKeys).toBe(1);
            expect(stats.environmentKeys).toBeGreaterThanOrEqual(2); // TEST_API_KEY and ANOTHER_TOKEN
            expect(stats.totalSources).toBe(2);
        });
    });

    describe('Edge Cases', () => {
        test('should handle null or undefined key references', () => {
            expect(apiKeyManager.resolveKey(null)).toBeNull();
            expect(apiKeyManager.resolveKey(undefined)).toBeNull();
            expect(apiKeyManager.resolveKey('')).toBeNull();
        });

        test('should handle empty CLI arguments', () => {
            const keyCount = apiKeyManager.parseCliArguments([]);
            expect(keyCount).toBe(0);
        });

        test('should handle CLI arguments without --api-key flag', () => {
            const args = ['node', 'script.js', '--other-flag', 'value'];
            const keyCount = apiKeyManager.parseCliArguments(args);
            expect(keyCount).toBe(0);
        });
    });
});
