/**
 * Injection class represents a specific type of prompt injection attack
 * It can detect if an injection is present in a user prompt and apply itself to a prompt
 */
export class Injection {
    constructor(name, type, description, patterns = []) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.patterns = patterns; // Array of strings or regex patterns to detect
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
