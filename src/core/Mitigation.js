import logger from './Logger.js';

/**
 * Mitigation class wraps one or more injection objects and decides how to handle detection results.
 * Contains state (On/Off), mode (Active/Passive), and action handling
 */
export class Mitigation {
    constructor(name, description, sourceUrl, injections = [], state = 'On', mode = 'Active', action = 'abort') {
        this.name = name;
        this.description = description;
        this.sourceUrl = sourceUrl; // GitHub repo URL or source reference
        this.state = state; // 'On' or 'Off'
        this.mode = mode; // 'Active' or 'Passive'
        this.injections = injections; // Array of Injection objects
        this.action = action; // 'abort', 'flag', 'silent'
        this.id = crypto.randomUUID();
        
        // Initialize logger with context
        this.logger = logger.withContext(`Mitigation:${this.name}`);
        
        this.logger.info('Mitigation created', {
            name: this.name,
            id: this.id,
            mode: this.mode,
            state: this.state,
            event: 'mitigation_created'
        });
    }

    /**
     * Process a user prompt through this mitigation
     * @param {string} userPrompt - The user's input text
     * @returns {object} Processing result with action taken
     */
    process(userPrompt) {
        this.logger.debug('Processing prompt', {
            event: 'mitigation_process_start',
            promptLength: userPrompt.length
        });
        
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
            this.logger.debug('Mitigation skipped', {
                event: 'mitigation_skipped'
            });
            return result;
        }

        // Run detection on all injections
        for (const injection of this.injections) {
            const detection = injection.detect(userPrompt);
            if (detection.detected) {
                result.detections.push(detection);
                this.logger.info('Injection pattern detected', {
                    event: 'injection_detected',
                    injectionType: injection.type,
                    injectionName: injection.name
                });
            }
        }

        // No detections found
        if (result.detections.length === 0) {
            result.action = 'allowed';
            result.reason = 'No injection patterns detected';
            this.logger.debug('No injections detected', {
                event: 'mitigation_passed'
            });
            return result;
        }

        // Handle detections based on mode
        switch (this.mode) {
            case 'Passive':
                result.action = 'reported';
                result.reason = `Detected ${result.detections.length} injection pattern(s), but allowing in passive mode`;
                result.passed = true;
                this.logger.info('Passive mode - allowing with detection', {
                    event: 'mitigation_passive',
                    detectionCount: result.detections.length
                });
                break;

            case 'Active':
                result.action = 'blocked';
                result.reason = `Blocked due to ${result.detections.length} detected injection pattern(s)`;
                result.passed = false;
                this.logger.warn('Active mode - blocking request', {
                    event: 'mitigation_blocked',
                    detectionCount: result.detections.length
                });
                break;

            default:
                result.action = 'error';
                result.reason = `Unknown mitigation mode: ${this.mode}`;
                result.passed = false;
                this.logger.error('Unknown mitigation mode', {
                    event: 'mitigation_error',
                    mode: this.mode
                });
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
