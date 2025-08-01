import { loadInjectionatorConfig, saveInjectionatorConfig } from '../src/core/InjectionatorConfig';
import { Injectionator } from '../src/core/Injectionator';
import fs from 'fs';

// Mock crypto.randomUUID for ES modules
global.crypto = {
    randomUUID: () => 'unique-id-' + Date.now()
};

describe('InjectionatorConfig Tests', () => {
    const testFilePath = '__tests__/Injectionator.json';
    let injectionator = null;

    beforeAll(() => {
        injectionator = loadInjectionatorConfig(testFilePath);
    });

    test('Load Injectionator Config', () => {
        expect(injectionator).not.toBeNull();
        expect(injectionator.name).toBe('Test Injectionator');
        expect(injectionator.description).toBe('Test description for Injectionator');
        expect(injectionator.sourceUrl).toBe('http://test-url.com');
        
        // Test send chain
        expect(injectionator.sendChain).not.toBeNull();
        expect(injectionator.sendChain.name).toBe('Test Send Chain');
        expect(injectionator.sendChain.mitigations).toHaveLength(1);
        
        // Test receive chain
        expect(injectionator.receiveChain).not.toBeNull();
        expect(injectionator.receiveChain.name).toBe('Test Receive Chain');
        expect(injectionator.receiveChain.mitigations).toHaveLength(1);
        
        // Test backend
        expect(injectionator.llmBackend).not.toBeNull();
        expect(injectionator.llmBackend.name).toBe('Test LLM Backend');
        expect(injectionator.llmBackend.type).toBe('llm');
    });

    test('Save Injectionator Config', () => {
        const savePath = '__tests__/SavedInjectionator.json';
        saveInjectionatorConfig(injectionator, savePath);
        
        const savedData = JSON.parse(fs.readFileSync(savePath, 'utf-8'));
        
        // Test basic properties
        expect(savedData.name).toBe('Test Injectionator');
        expect(savedData.description).toBe('Test description for Injectionator');
        expect(savedData.sourceUrl).toBe('http://test-url.com');
        
        // Test chains are saved
        expect(savedData.sendChain).not.toBeNull();
        expect(savedData.sendChain.name).toBe('Test Send Chain');
        expect(savedData.receiveChain).not.toBeNull();
        expect(savedData.receiveChain.name).toBe('Test Receive Chain');
        
        // Test backend is saved
        expect(savedData.backend).not.toBeNull();
        expect(savedData.backend.name).toBe('Test LLM Backend');
        expect(savedData.backend.type).toBe('llm');
        
        // Test injections are saved (keyed by mitigation names)
        expect(savedData.injections).not.toBeNull();
        expect(savedData.injections['Role Play Detection']).toBeDefined();
        expect(savedData.injections['Data Sanitization']).toBeDefined();
        expect(savedData.injections['Role Play Detection'].name).toBe('role-play');
        expect(savedData.injections['Data Sanitization'].name).toBe('sanitize');

        // Cleanup
        fs.unlinkSync(savePath);
    });
    
    test('Round-trip save and load', () => {
        const savePath = '__tests__/RoundTripInjectionator.json';
        
        // Save the loaded injectionator
        saveInjectionatorConfig(injectionator, savePath);
        
        // Load it back
        const reloadedInjectionator = loadInjectionatorConfig(savePath);
        
        // Verify they match
        expect(reloadedInjectionator.name).toBe(injectionator.name);
        expect(reloadedInjectionator.description).toBe(injectionator.description);
        expect(reloadedInjectionator.sourceUrl).toBe(injectionator.sourceUrl);
        expect(reloadedInjectionator.sendChain.name).toBe(injectionator.sendChain.name);
        expect(reloadedInjectionator.receiveChain.name).toBe(injectionator.receiveChain.name);
        expect(reloadedInjectionator.llmBackend.name).toBe(injectionator.llmBackend.name);

        // Cleanup
        fs.unlinkSync(savePath);
    });
    
    test('Validate loaded injectionator', () => {
        const validation = injectionator.validate();
        expect(validation.valid).toBe(true);
        expect(validation.issues).toHaveLength(0);
    });
});


