import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';
import { InjectionatorFactory } from '../../src/core/InjectionatorFactory.js';
import { Injectionator } from '../../src/core/Injectionator.js';

// Mock the dependencies
jest.mock('fs');
jest.mock('../../src/core/Injectionator.js');

describe('InjectionatorFactory', () => {
    let factory;
    const mockConfig = {
        name: 'Test Injectionator',
        sendChain: { name: 'Send', mitigations: [] },
        receiveChain: { name: 'Receive', mitigations: [] },
        backend: { name: 'mock-backend', type: 'llm' },
        injections: {},
    };

    beforeEach(() => {
        factory = new InjectionatorFactory();
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    describe('createFromFile', () => {
        it('should create an Injectionator from a valid config file', async () => {
            // Arrange
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
            const mockInjectionator = { validate: jest.fn().mockReturnValue({ valid: true }) };
            Injectionator.fromJSON.mockReturnValue(mockInjectionator);

            // Act
            const result = await factory.createFromFile('config.json');

            // Assert
            expect(fs.existsSync).toHaveBeenCalledWith('config.json');
            expect(fs.readFileSync).toHaveBeenCalledWith('config.json', 'utf-8');
            expect(Injectionator.fromJSON).toHaveBeenCalledWith(mockConfig);
            expect(result).toBe(mockInjectionator);
        });

        it('should throw if the config file is not found', async () => {
            fs.existsSync.mockReturnValue(false);
            await expect(factory.createFromFile('not-found.json')).rejects.toThrow('Configuration file not found');
        });
    });

    describe('createFromConfig', () => {
        it('should create an Injectionator from a valid config object', async () => {
            const mockInjectionator = { id: '123', name: 'Test', validate: jest.fn().mockReturnValue({ valid: true }) };
            Injectionator.fromJSON.mockReturnValue(mockInjectionator);

            const result = await factory.createFromConfig(mockConfig);

            expect(Injectionator.fromJSON).toHaveBeenCalledWith(mockConfig);
            expect(result).toBe(mockInjectionator);
        });

        it('should throw if config validation fails', async () => {
            const invalidConfig = { ...mockConfig, name: undefined };
            await expect(factory.createFromConfig(invalidConfig)).rejects.toThrow('Missing required configuration fields: name');
        });
    });

    describe('createFromDirectory', () => {
        it('should create injectionators from all valid json files in a directory', async () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['a.json', 'b.json', 'c.txt']);
            
            const mockInjectionatorA = { name: 'A', validate: () => ({ valid: true }) };
            const mockInjectionatorB = { name: 'B', validate: () => ({ valid: true }) };

            const createFromFileSpy = jest.spyOn(factory, 'createFromFile')
                .mockResolvedValueOnce(mockInjectionatorA)
                .mockResolvedValueOnce(mockInjectionatorB);

            const result = await factory.createFromDirectory('/configs');

            expect(result.get('a')).toBe(mockInjectionatorA);
            expect(result.get('b')).toBe(mockInjectionatorB);
            expect(result.has('c')).toBe(false);
            expect(createFromFileSpy).toHaveBeenCalledTimes(2);

            createFromFileSpy.mockRestore();
        });
    });

    describe('saveToFile', () => {
        it('should save a valid injectionator to a file', async () => {
            // Arrange
            const mockInjectionator = new Injectionator();
            mockInjectionator.toJSON.mockReturnValue(mockConfig);
            fs.writeFileSync.mockImplementation(() => {});

            // Act
            await factory.saveToFile(mockInjectionator, 'config.json');

            // Assert
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                'config.json',
                JSON.stringify(mockConfig, null, 2),
                'utf-8'
            );
            expect(mockInjectionator.toJSON).toHaveBeenCalled();
        });
    });
});
