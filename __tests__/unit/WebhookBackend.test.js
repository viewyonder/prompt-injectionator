import { WebhookBackend } from '../../src/backends/WebhookBackend.js';

describe('WebhookBackend', () => {
  it('should process a prompt and return a mocked response', async () => {
    const backend = new WebhookBackend();
    const result = await backend.process('test prompt');
    expect(result.success).toBe(true);
    expect(result.response).toBe('I\'m only a mockup, not a real boy');
  });

  it('should fail validation if the URL is missing', () => {
    const backend = new WebhookBackend('Test Webhook', { url: null });
    const validation = backend.validate();
    expect(validation.valid).toBe(false);
    expect(validation.issues).toContain('Webhook URL is required');
  });

  it('should fail validation if the URL is invalid', () => {
    const backend = new WebhookBackend('Test Webhook', { url: 'ftp://invalid-url' });
    const validation = backend.validate();
    expect(validation.valid).toBe(false);
    expect(validation.issues).toContain('Webhook URL must be a valid HTTP/HTTPS URL');
  });
});
