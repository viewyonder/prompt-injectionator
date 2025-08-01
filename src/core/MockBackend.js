const Backend = require('./Backend');

class MockBackend extends Backend {
    constructor(name = 'MockBackend') {
        super(name);
    }

    send(prompt) {
        console.log(`[${this.name}] Received prompt: ${prompt}`);
        return {
            success: true,
            response: `Mock response for: ${prompt}`
        };
    }
}

module.exports = MockBackend;

