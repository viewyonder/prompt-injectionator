import { jest } from '@jest/globals';
import { ConfigurationManager } from '../../src/cli/ConfigurationManager.js';
import { InjectionatorFactory } from '../../src/core/InjectionatorFactory.js';

jest.mock('../../src/core/InjectionatorFactory.js');

describe('ConfigurationManager', () => {
  let configManager;
  let factoryMock;

  beforeEach(() => {
    jest.clearAllMocks();
    configManager = new ConfigurationManager();
    factoryMock = InjectionatorFactory.mock.instances[0];
  });

  it('should load a configuration from a file', async () => {
    const mockInjectionator = { name: 'test-injectionator' };
    factoryMock.createFromFile.mockResolvedValue(mockInjectionator);

    const result = await configManager.loadFromFile('config.json');

    expect(factoryMock.createFromFile).toHaveBeenCalledWith('config.json');
    expect(result.success).toBe(true);
    expect(result.injectionator).toBe(mockInjectionator);
  });

  it('should handle errors when loading a configuration fails', async () => {
    factoryMock.createFromFile.mockRejectedValue(new Error('File not found'));

    const result = await configManager.loadFromFile('nonexistent.json');

    expect(result.success).toBe(false);
    expect(result.error).toBe('File not found');
  });

  it('should save a configuration to a file', async () => {
    const mockInjectionator = { name: 'test-injectionator' };
    factoryMock.saveToFile.mockResolvedValue();

    const result = await configManager.saveToFile(mockInjectionator, 'config.json');

    expect(factoryMock.saveToFile).toHaveBeenCalledWith(mockInjectionator, 'config.json');
    expect(result.success).toBe(true);
  });

  it('should create an injectionator from a template', async () => {
    const templateConfig = { name: 'template-config' };
    configManager.templates.set('test-template', { generator: () => templateConfig });
    
    const mockInjectionator = { name: 'new-from-template' };
    factoryMock.createFromConfig.mockResolvedValue(mockInjectionator);

    const result = await configManager.createFromTemplate('test-template', 'new-injectionator');

    expect(factoryMock.createFromConfig).toHaveBeenCalledWith(templateConfig);
    expect(result.success).toBe(true);
    expect(result.injectionator).toBe(mockInjectionator);
  });
});
