import { InjectionatorFactory } from '../../src/core/InjectionatorFactory.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Complete Injectionator System Test', () => {
  it('should load a configuration and execute the injectionator', async () => {
    const factory = new InjectionatorFactory();
    const configPath = path.resolve(__dirname, './test-config.json');
    const injectionator = await factory.createFromFile(configPath);

    const prompt = 'test prompt';
    const result = await injectionator.execute(prompt);

    expect(result.success).toBe(true);
    expect(result.finalResponse).toBe('I\'m only a mockup, not a real boy');
  });
});
