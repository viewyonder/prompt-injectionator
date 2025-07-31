/**
 * Mitigation class wraps a single injection object and decides how to handle detection results
 * Contains state (On/Off), mode (Active/Passive), and action handling
 */
export class Mitigation {
    constructor(name, description, sourceUrl, injection, state = 'On', mode = 'Active', action = 'abort') {
        this.name = name;
        this.description = description;
        this.sourceUrl = sourceUrl; // GitHub repo URL or source reference
        this.state = state; // 'On' or 'Off'
        this.mode = mode; // 'Active' or 'Passive'
        this.injection = injection; // Single Injection object
        this.action = action; // 'abort', 'flag', 'silent'
        this.id = crypto.randomUUID();
    }

    /**
     * Process a user prompt through this mitigation
     * @param {string} userPrompt - The user's input text
     * @returns {object} Processing result with action taken
     */
    process(userPrompt) {
        const result = {
            mitigationName: this.name,
            mitigationMode: this.mode,
            action: null,
            detections: [],
            passed: true,
            reason: null,
            timestamp: new Date()
        };

        // Skip mode - do nothing
        if (this.mode === 'Skip') {
            result.action = 'skipped';
            result.reason = 'Mitigation is in skip mode';
            return result;
        }

        // Run detection on all injections
        for (const injection of this.injections) {
            const detection = injection.detect(userPrompt);
            if (detection.detected) {
                result.detections.push(detection);
            }
        }

        // No detections found
        if (result.detections.length === 0) {
            result.action = 'allowed';
            result.reason = 'No injection patterns detected';
            return result;
        }

        // Handle detections based on mode
        switch (this.mode) {
            case 'Passive':
                result.action = 'reported';
                result.reason = `Detected ${result.detections.length} injection pattern(s), but allowing in passive mode`;
                result.passed = true;
                break;

            case 'Active':
                result.action = 'blocked';
                result.reason = `Blocked due to ${result.detections.length} detected injection pattern(s)`;
                result.passed = false;
                break;

            default:
                result.action = 'error';
                result.reason = `Unknown mitigation mode: ${this.mode}`;
                result.passed = false;
        }

        return result;
    }

    /**
     * Add an injection to this mitigation
     * @param {Injection} injection - Injection object to add
     */
    addInjection(injection) {
        this.injections.push(injection);
    }

    /**
     * Remove an injection from this mitigation
     * @param {string} injectionId - ID of injection to remove
     */
    removeInjection(injectionId) {
        this.injections = this.injections.filter(inj => inj.id !== injectionId);
    }

    /**
     * Change the mitigation mode
     * @param {string} newMode - New mode ('Skip', 'Passive', 'Active')
     */
    setMode(newMode) {
        const validModes = ['Skip', 'Passive', 'Active'];
        if (!validModes.includes(newMode)) {
            throw new Error(`Invalid mode: ${newMode}. Must be one of: ${validModes.join(', ')}`);
        }
        this.mode = newMode;
    }

    getDetails() {
        return {
            id: this.id,
            name: this.name,
            mode: this.mode,
            description: this.description,
            injections: this.injections.map(inj => inj.getDetails())
        };
    }
}
