import fs from 'fs';
import { jest } from '@jest/globals';
import { saveInjectionatorConfig, loadInjectionatorConfig } from '../../src/core/InjectionatorConfig.js';
import { Injectionator } from '../../src/core/Injectionator.js';

describe('InjectionatorConfig', () => {
  const mockConfig = {
    name: 'test-injectionator',
    steps: [{ type: 'injection', data: 'test-prompt' }],
  };
  const filePath = './test-config.json';

  afterEach(() => {
    // Restore all mocks after each test to ensure test isolation
    jest.restoreAllMocks();
  });

  describe('saveInjectionatorConfig', () => {
    test('should serialize the injectionator config and save it to a file', () => {
      // Arrange
      const mockInjectionator = {
        toJSON: jest.fn().mockReturnValue(mockConfig),
      };
      // Spy on fs.writeFileSync and provide a mock implementation
      const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

      // Act
      saveInjectionatorConfig(mockInjectionator, filePath);

      // Assert
      expect(mockInjectionator.toJSON).toHaveBeenCalledTimes(1);
      expect(writeSpy).toHaveBeenCalledWith(
        filePath,
        JSON.stringify(mockConfig, null, 2)
      );
    });
  });

  describe('loadInjectionatorConfig', () => {
    test('should read a file, parse it, and create an Injectionator instance', () => {
      // Arrange
      const stringifiedConfig = JSON.stringify(mockConfig);
      // Spy on fs.readFileSync to return a mock config
      jest.spyOn(fs, 'readFileSync').mockReturnValue(stringifiedConfig);
      
      const mockLoadedInjectionator = { name: 'loaded-injectionator' };
      // Spy on the static fromJSON method of Injectionator
      const fromJSONSpy = jest.spyOn(Injectionator, 'fromJSON').mockReturnValue(mockLoadedInjectionator);

      // Act
      const loadedInjectionator = loadInjectionatorConfig(filePath);

      // Assert
      expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf-8');
      expect(fromJSONSpy).toHaveBeenCalledWith(mockConfig);
      expect(loadedInjectionator).toBe(mockLoadedInjectionator);
    });

    test('should throw an error if the file does not exist', () => {
        // Arrange
        // Spy on fs.readFileSync to simulate a file-not-found error
        jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
            throw new Error('File not found');
        });

        // Act & Assert
        expect(() => loadInjectionatorConfig('non-existent-file.json')).toThrow('File not found');
    });
  });
});

