class Backend {
    constructor(name) {
        this.name = name;
    }

    send(prompt) {
        throw new Error("Method 'send()' must be implemented.");
    }
}

export default Backend;
