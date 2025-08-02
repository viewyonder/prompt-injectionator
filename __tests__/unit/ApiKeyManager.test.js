import { ApiKeyManager } from '../../src/core/ApiKeyManager.js';

describe('ApiKeyManager', () => {
  let apiKeyManager;

  beforeEach(() => {
    apiKeyManager = new ApiKeyManager();
    apiKeyManager.clearRuntimeKeys();
    delete process.env.TEST_API_KEY;
    delete process.env.KEY2;
  });

  describe('addRuntimeKey and resolveKey', () => {
    test('should store and retrieve a runtime key', () => {
      apiKeyManager.addRuntimeKey('TEST_RUNTIME_KEY', 'runtime-key-value');
      expect(apiKeyManager.resolveKey('TEST_RUNTIME_KEY')).toBe('runtime-key-value');
    });

    test('should throw an error if keyName or keyValue is missing', () => {
      expect(() => apiKeyManager.addRuntimeKey('TEST_KEY')).toThrow('Both keyName and keyValue are required');
      expect(() => apiKeyManager.addRuntimeKey(null, 'value')).toThrow('Both keyName and keyValue are required');
    });
  });

  describe('resolveKey with environment variables', () => {
    test('should resolve a key from environment variables', () => {
      process.env.TEST_API_KEY = 'env-key-value';
      expect(apiKeyManager.resolveKey('TEST_API_KEY')).toBe('env-key-value');
    });
  });

  describe('resolveKey priority', () => {
    test('should prioritize runtime key over environment variable', () => {
      process.env.TEST_API_KEY = 'env-key-value';
      apiKeyManager.addRuntimeKey('TEST_API_KEY', 'runtime-key-value');
      expect(apiKeyManager.resolveKey('TEST_API_KEY')).toBe('runtime-key-value');
    });
  });

  describe('resolveKey for non-existent key', () => {
    test('should return null for a non-existent key', () => {
      expect(apiKeyManager.resolveKey('NON_EXISTENT_KEY')).toBeNull();
    });
  });

  describe('validateKeys', () => {
    test('should return valid when all keys are present', () => {
      apiKeyManager.addRuntimeKey('KEY1', 'value1');
      process.env.KEY2 = 'value2';
      const result = apiKeyManager.validateKeys(['KEY1', 'KEY2']);
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.available).toEqual(['KEY1', 'KEY2']);
    });

    test('should return invalid with missing keys', () => {
      apiKeyManager.addRuntimeKey('KEY1', 'value1');
      const result = apiKeyManager.validateKeys(['KEY1', 'MISSING_KEY']);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['MISSING_KEY']);
      expect(result.available).toEqual(['KEY1']);
    });
  });

  describe('parseCliArguments', () => {
    test('should parse and add runtime keys from arguments', () => {
      const args = ['--api-key', 'CLI_KEY=cli-value'];
      apiKeyManager.parseCliArguments(args);
      expect(apiKeyManager.resolveKey('CLI_KEY')).toBe('cli-value');
    });

    test('should parse multiple keys', () => {
      const args = ['--api-key', 'CLI_KEY1=val1', '--api-key', 'CLI_KEY2=val2'];
      const count = apiKeyManager.parseCliArguments(args);
      expect(count).toBe(2);
      expect(apiKeyManager.resolveKey('CLI_KEY1')).toBe('val1');
      expect(apiKeyManager.resolveKey('CLI_KEY2')).toBe('val2');
    });

    test('should handle keys with equals signs in the value', () => {
        const args = ['--api-key', 'KEY_WITH_EQUALS=part1=part2'];
        apiKeyManager.parseCliArguments(args);
        expect(apiKeyManager.resolveKey('KEY_WITH_EQUALS')).toBe('part1=part2');
    });
  });

  describe('clearRuntimeKeys', () => {
    test('should clear all runtime keys', () => {
      apiKeyManager.addRuntimeKey('KEY1', 'value1');
      apiKeyManager.clearRuntimeKeys();
      expect(apiKeyManager.resolveKey('KEY1')).toBeNull();
    });
  });
});

