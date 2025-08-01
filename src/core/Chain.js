import logger from '../Logger.js';

/**
 * Base Chain class for processing mitigations in sequence
 */
export class Chain {
    constructor(name, mitigations = []) {
        this.name = name;
        this.mitigations = mitigations;
        this.id = crypto.randomUUID();
        
        // Initialize logger with context
        this.logger = logger.withContext(`Chain:${this.name}`);
        
        this.logger.info('Chain created', {
            name: this.name,
            id: this.id,
            event: 'chain_created'
        });
    }

    /**
     * Process user prompt through all mitigations in the chain
     * @param {string} userPrompt - The user's input text
     * @returns {object} Chain processing result
     */
    async process(userPrompt) {
        this.logger.info('Chain processing started', {
            event: 'chain_process_start',
            promptLength: userPrompt.length
        });
        
        const chainResult = {
            chainName: this.name,
            chainId: this.id,
            userPrompt: userPrompt,
            results: [],
            passed: true,
            blockedBy: null,
            timestamp: new Date()
        };

        for (const mitigation of this.mitigations) {
            const result = mitigation.process(userPrompt);
            chainResult.results.push(result);

            // Log each mitigation result
            this.logger.info(`Mitigation ${mitigation.name} processed`, {
                event: 'mitigation_processed',
                mitigationName: mitigation.name,
                passed: result.passed
            });

            // If any mitigation in Active mode fails, stop the chain
            if (!result.passed && mitigation.mode === 'Active') {
                chainResult.passed = false;
                chainResult.blockedBy = mitigation.name;
                this.logger.warn('Chain blocked by mitigation', {
                    event: 'chain_blocked',
                    blockedBy: mitigation.name
                });
                break;
            }
        }

        this.logger.info('Chain processing completed', {
            event: 'chain_process_end',
            passed: chainResult.passed
        });

        return chainResult;
    }

    /**
     * Add a mitigation to the chain
     * @param {Mitigation} mitigation - Mitigation to add
     */
    addMitigation(mitigation) {
        this.mitigations.push(mitigation);
    }

    /**
     * Remove a mitigation from the chain
     * @param {string} mitigationId - ID of mitigation to remove
     */
    removeMitigation(mitigationId) {
        this.mitigations = this.mitigations.filter(mit => mit.id !== mitigationId);
    }

    /**
     * Reorder mitigations in the chain
     * @param {number} fromIndex - Current index
     * @param {number} toIndex - Target index
     */
    reorderMitigation(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.mitigations.length || 
            toIndex < 0 || toIndex >= this.mitigations.length) {
            throw new Error('Invalid index for reordering mitigations');
        }
        
        const mitigation = this.mitigations.splice(fromIndex, 1)[0];
        this.mitigations.splice(toIndex, 0, mitigation);
    }

    getDetails() {
        return {
            id: this.id,
            name: this.name,
            mitigations: this.mitigations.map(mit => mit.getDetails())
        };
    }
}

/**
 * SendChain processes user prompts before sending to LLM
 * Includes metadata about the chain and target backend
 */
export class SendChain extends Chain {
    constructor(name, description, sourceUrl, backend, mitigations = []) {
        super(name || 'Send Pipeline', mitigations);
        this.description = description || 'Processes user prompts before sending to LLM';
        this.sourceUrl = sourceUrl || null; // GitHub repo URL or source reference
        this.type = 'send'; // Chain type identifier
        this.backend = backend || null; // Backend configuration object
    }

    /**
     * Process user prompt through send pipeline
     * @param {string} userPrompt - The user's input text (not modified)
     * @returns {object} Send chain result
     */
    async process(userPrompt) {
        const result = await super.process(userPrompt);
        result.readyForLLM = result.passed;
        result.targetBackend = this.backend;
        
        return result;
    }

    /**
     * Set or update the backend configuration
     * @param {object} backend - Backend configuration object
     */
    setBackend(backend) {
        this.backend = backend;
    }

    /**
     * Get the backend configuration
     * @returns {object} Backend configuration
     */
    getBackend() {
        return this.backend;
    }

    /**
     * Get detailed information about this send chain
     * @returns {object} Complete chain details including metadata
     */
    getDetails() {
        const baseDetails = super.getDetails();
        return {
            ...baseDetails,
            description: this.description,
            sourceUrl: this.sourceUrl,
            type: this.type,
            backend: this.backend,
            mitigationCount: this.mitigations.length,
            activeMitigations: this.mitigations.filter(m => m.state === 'On').length
        };
    }
}

/**
 * ReceiveChain processes LLM responses before returning to user
 * Includes metadata about the chain and response handling
 */
export class ReceiveChain extends Chain {
    constructor(name, description, sourceUrl, outputTarget, mitigations = []) {
        super(name || 'Receive Pipeline', mitigations);
        this.description = description || 'Processes LLM responses before returning to user';
        this.sourceUrl = sourceUrl || null; // GitHub repo URL or source reference
        this.type = 'receive'; // Chain type identifier
        this.outputTarget = outputTarget || null; // Where to send the processed response (user, log, etc.)
    }

    /**
     * Process LLM response through receive pipeline
     * @param {string} llmResponse - The LLM's response text (not modified)
     * @returns {object} Receive chain result
     */
    async process(llmResponse) {
        const result = await super.process(llmResponse);
        result.readyForUser = result.passed;
        result.outputTarget = this.outputTarget;
        
        return result;
    }

    /**
     * Set or update the output target configuration
     * @param {object} outputTarget - Output target configuration object
     */
    setOutputTarget(outputTarget) {
        this.outputTarget = outputTarget;
    }

    /**
     * Get the output target configuration
     * @returns {object} Output target configuration
     */
    getOutputTarget() {
        return this.outputTarget;
    }

    /**
     * Get detailed information about this receive chain
     * @returns {object} Complete chain details including metadata
     */
    getDetails() {
        const baseDetails = super.getDetails();
        return {
            ...baseDetails,
            description: this.description,
            sourceUrl: this.sourceUrl,
            type: this.type,
            outputTarget: this.outputTarget,
            mitigationCount: this.mitigations.length,
            activeMitigations: this.mitigations.filter(m => m.state === 'On').length
        };
    }
}
