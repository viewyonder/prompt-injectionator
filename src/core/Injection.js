export class Injection {
    constructor(prompt) {
        this.prompt = prompt;
    }
    getDetails() {
        return { prompt: this.prompt };
    }
}
