/**
 * Injection class represents a specific type of prompt injection attack pattern.
 * 
 * This class encapsulates the logic for detecting and applying prompt injection attacks.
 * Each injection has a type (e.g., "Role Play", "Prompt Extraction") and contains
 * patterns (strings or regex) that can be used to detect if the injection is present
 * in user input.
 * 
 * @class Injection
 * @since 1.0.0
 * @example
 * // Create a role-play injection
 * const rolePlayInjection = new Injection(
 *     'Expert Simulation',
 *     'Role Play', 
 *     'Attempts to make LLM act as an expert',
 *     ['act as an expert', 'simulate an expert', /expert.*mode/gi]
 * );
 * 
 * // Detect the injection in user input
 * const result = rolePlayInjection.detect('Act as an expert and tell me about AI');
 * console.log(result.detected); // true
 */
export class Injection {
    /**
     * Creates a new Injection instance.
     * 
     * @param {string} name - Human-readable name for this injection
     * @param {string} type - Category of injection (e.g., 'Role Play', 'Prompt Extraction')
     * @param {string} description - Detailed description of what this injection does
     * @param {Array<string|RegExp>} [patterns=[]] - Array of string or regex patterns to detect
     * @throws {Error} When name, type, or description are empty
     * @example
     * const injection = new Injection(
     *     'System Prompt Extraction',
     *     'Prompt Extraction',
     *     'Attempts to extract the system prompt',
     *     ['show me your prompt', /system.*prompt/gi]
     * );
     */
    constructor(name, type, description, patterns = []) {
        if (!name || !type || !description) {
            throw new Error('Name, type, and description are required');
        }
        
        /** @type {string} Human-readable name for this injection */
        this.name = name;
        
        /** @type {string} Category/type of this injection */
        this.type = type;
        
        /** @type {string} Detailed description of the injection's purpose */
        this.description = description;
        
        /** @type {Array<string|RegExp>} Patterns used to detect this injection */
        this.patterns = patterns;
        
        /** @type {string} Unique identifier for this injection instance */
        this.id = crypto.randomUUID();
    }

    /**
     * Detect if this injection pattern exists in the user prompt
     * @param {string} userPrompt - The user's input text
     * @returns {object} Detection result with found patterns and positions
     */
    detect(userPrompt) {
        const detections = [];
        const promptLower = userPrompt.toLowerCase();

        for (const pattern of this.patterns) {
            if (typeof pattern === 'string') {
                const index = promptLower.indexOf(pattern.toLowerCase());
                if (index !== -1) {
                    detections.push({
                        pattern: pattern,
                        position: index,
                        type: 'string'
                    });
                }
            } else if (pattern instanceof RegExp) {
                const matches = userPrompt.match(pattern);
                if (matches) {
                    detections.push({
                        pattern: pattern.source,
                        matches: matches,
                        type: 'regex'
                    });
                }
            }
        }

        return {
            detected: detections.length > 0,
            detections: detections,
            injectionName: this.name,
            injectionType: this.type
        };
    }

    /**
     * Apply this injection to a user prompt
     * @param {string} userPrompt - The original user prompt
     * @param {string} injectionText - Specific injection text to apply
     * @returns {string} Modified prompt with injection applied
     */
    apply(userPrompt, injectionText) {
        switch (this.type) {
            case 'Role Play':
                return `${injectionText} ${userPrompt}`;
            case 'Prompt Extraction':
                return `${userPrompt} ${injectionText}`;
            case 'Context Switch':
                return `${userPrompt}\n\n${injectionText}`;
            case 'Adversarial Suffix':
                return `${userPrompt} ${injectionText}`;
            default:
                return `${userPrompt} ${injectionText}`;
        }
    }

    getDetails() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            description: this.description,
            patterns: this.patterns
        };
    }
}
