import { Injection } from '../src/core/Injection';

describe('Injection', () => {
    test('should store the prompt text correctly', () => {
        const promptText = "Tell me a story.";
        const injection = new Injection(promptText);
        expect(injection.getDetails()).toEqual({ prompt: promptText });
    });
});
