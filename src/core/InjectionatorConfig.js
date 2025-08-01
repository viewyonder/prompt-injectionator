import fs from 'fs';
import { Injectionator } from './core/Injectionator.js';

/**
 * Save the Injectionator configuration to a JSON file
 * @param {Injectionator} injectionator - The Injectionator instance
 * @param {string} filePath - File path to save the configuration
 */
export function saveInjectionatorConfig(injectionator, filePath) {
    const config = injectionator.toJSON();
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
}

/**
 * Load the Injectionator configuration from a JSON file
 * @param {string} filePath - File path to load the configuration from
 * @returns {Injectionator} - The loaded Injectionator instance
 */
export function loadInjectionatorConfig(filePath) {
    const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Injectionator.fromJSON(config);
}
