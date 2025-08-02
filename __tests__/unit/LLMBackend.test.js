import { LLMBackend } from '../../src/backends/LLMBackend.js';
import apiKeyManager from '../../src/core/ApiKeyManager.js';

describe('LLMBackend', () => {
  it('should process a prompt and return a mocked response', async () => {
    const backend = new LLMBackend();
    const result = await backend.process('test prompt');
    expect(result.success).toBe(true);
    expect(result.response).toBe('I\'m only a mockup, not a real boy');
  });

  it('should resolve an API key from the api key manager', () => {
    apiKeyManager.addRuntimeKey('TEST_API_KEY', 'test-key-value');
    const backend = new LLMBackend('Test Backend', { apiKeyRef: 'TEST_API_KEY' });
    expect(backend.apiKey).toBe('test-key-value');
  });

  it('should fail validation if an API key is required but not found', () => {
    const backend = new LLMBackend('Test Backend', { provider: 'openai', apiKeyRef: 'MISSING_KEY' });
    const validation = backend.validate();
    expect(validation.valid).toBe(false);
    expect(validation.issues).toContain("API key 'MISSING_KEY' could not be resolved. Check environment variables or CLI arguments.");
  });
});
