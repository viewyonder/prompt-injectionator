/**
 * Injection Library Index
 * 
 * This module exports all available injection classes for the Prompt Injectionator.
 * All injection names follow kebab-case convention.
 * 
 * @module injections
 */

import { RolePlayInjection } from './role-play.js';
import { PromptExtractionInjection } from './prompt-extraction.js';
import { JailbreakDanInjection } from './jailbreak-dan.js';
import { SycophanticalGrandmaInjection } from './sycophantic-grandma.js';
import { TokenSmugglingInjection } from './token-smuggling.js';
import { ContextSwitchInjection } from './context-switch.js';

// Export all injection classes
export {
    RolePlayInjection,
    PromptExtractionInjection,
    JailbreakDanInjection,
    SycophanticalGrandmaInjection,
    TokenSmugglingInjection,
    ContextSwitchInjection
};

/**
 * Registry of all available injections with kebab-case keys
 * This makes it easy to instantiate injections by name
 */
export const INJECTION_REGISTRY = {
    'role-play': RolePlayInjection,
    'prompt-extraction': PromptExtractionInjection,
    'jailbreak-dan': JailbreakDanInjection,
    'sycophantic-grandma': SycophanticalGrandmaInjection,
    'token-smuggling': TokenSmugglingInjection,
    'context-switch': ContextSwitchInjection
};

/**
 * Create an injection instance by kebab-case name
 * @param {string} injectionName - The kebab-case name of the injection
 * @returns {Injection} The injection instance
 * @throws {Error} If injection name is not found
 */
export function createInjection(injectionName) {
    const InjectionClass = INJECTION_REGISTRY[injectionName];
    if (!InjectionClass) {
        const availableNames = Object.keys(INJECTION_REGISTRY);
        throw new Error(`Unknown injection: ${injectionName}. Available injections: ${availableNames.join(', ')}`);
    }
    return new InjectionClass();
}

/**
 * Get all available injection names in kebab-case format
 * @returns {string[]} Array of injection names
 */
export function getAvailableInjectionNames() {
    return Object.keys(INJECTION_REGISTRY);
}

/**
 * Create all available injections as instances
 * @returns {Object<string, Injection>} Object mapping kebab-case names to injection instances
 */
export function createAllInjections() {
    const injections = {};
    for (const [name, InjectionClass] of Object.entries(INJECTION_REGISTRY)) {
        injections[name] = new InjectionClass();
    }
    return injections;
}
