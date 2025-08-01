const Backend = require('./Backend');

class LLMBackend extends Backend {
    constructor(name) {
        super(name);
        this.type = 'LLM';
    }

    send(prompt) {
        throw new Error("Method 'send()' must be implemented by LLM backend subclasses.");
    }

    // Common LLM methods that subclasses can use
    formatPrompt(prompt) {
        // Default implementation - subclasses can override
        return prompt;
    }

    parseResponse(response) {
        // Default implementation - subclasses can override
        return response;
    }
}

module.exports = LLMBackend;
