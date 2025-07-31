/**
 * Injectionator class orchestrates the complete flow using Chain of Responsibility pattern
 * Flow: userPrompt -> sendChain -> LLM -> receiveChain -> user
 */
export class Injectionator {
    constructor(name, description, sourceUrl, sendChain, receiveChain, llmBackend) {
        this.name = name || 'Default Injectionator';
        this.description = description || 'Processes prompts through security chains and LLM';
        this.sourceUrl = sourceUrl || null;
        this.sendChain = sendChain || null;
        this.receiveChain = receiveChain || null;
        this.llmBackend = llmBackend || null;
        this.id = crypto.randomUUID();
        this.createdAt = new Date();
        this.lastModified = new Date();
    }

    /**
     * Execute the complete injectionator flow
     * @param {string} userPrompt - The user's input text
     * @returns {object} Complete execution result
     */
    async execute(userPrompt) {
        const executionResult = {
            injectionatorId: this.id,
            injectionatorName: this.name,
            userPrompt: userPrompt,
            startTime: new Date(),
            endTime: null,
            success: false,
            finalResponse: null,
            steps: [],
            blockedAt: null,
            error: null
        };

        try {
            // Step 1: Process through Send Chain
            if (this.sendChain) {
                const sendResult = await this.sendChain.process(userPrompt);
                executionResult.steps.push({
                    step: 'send_chain',
                    chainName: this.sendChain.name,
                    result: sendResult,
                    timestamp: new Date()
                });

                if (!sendResult.passed) {
                    executionResult.blockedAt = 'send_chain';
                    executionResult.finalResponse = this._generateBlockedResponse(sendResult);
                    executionResult.endTime = new Date();
                    return executionResult;
                }
            }

            // Step 2: Call LLM Backend
            if (this.llmBackend) {
                const llmResult = await this._callLLM(userPrompt);
                executionResult.steps.push({
                    step: 'llm_backend',
                    backendName: this.llmBackend.name || 'Unknown LLM',
                    result: llmResult,
                    timestamp: new Date()
                });

                if (!llmResult.success) {
                    executionResult.error = llmResult.error;
                    executionResult.blockedAt = 'llm_backend';
                    executionResult.finalResponse = this._generateErrorResponse(llmResult.error);
                    executionResult.endTime = new Date();
                    return executionResult;
                }

                // Step 3: Process LLM response through Receive Chain
                if (this.receiveChain) {
                    const receiveResult = await this.receiveChain.process(llmResult.response);
                    executionResult.steps.push({
                        step: 'receive_chain',
                        chainName: this.receiveChain.name,
                        result: receiveResult,
                        timestamp: new Date()
                    });

                    if (!receiveResult.passed) {
                        executionResult.blockedAt = 'receive_chain';
                        executionResult.finalResponse = this._generateBlockedResponse(receiveResult);
                        executionResult.endTime = new Date();
                        return executionResult;
                    }
                }

                // Success - all chains passed
                executionResult.success = true;
                executionResult.finalResponse = llmResult.response;
            } else {
                throw new Error('No LLM backend configured');
            }

        } catch (error) {
            executionResult.error = error.message;
            executionResult.finalResponse = this._generateErrorResponse(error.message);
        }

        executionResult.endTime = new Date();
        return executionResult;
    }

    /**
     * Mock LLM call - in real implementation this would call actual LLM APIs
     * @param {string} prompt - The user prompt to send to LLM
     * @returns {object} LLM response result
     */
    async _callLLM(prompt) {
        try {
            // Mock implementation - replace with actual LLM API calls
            if (!this.llmBackend) {
                throw new Error('No LLM backend configured');
            }

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 100));

            // Mock response based on backend type
            const mockResponse = `Mock response from ${this.llmBackend.provider || 'LLM'} for prompt: "${prompt}"`;
            
            return {
                success: true,
                response: mockResponse,
                metadata: {
                    backend: this.llmBackend,
                    tokens: prompt.length,
                    processingTime: 100
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate a blocked response message
     * @param {object} chainResult - The chain result that caused the block
     * @returns {string} Blocked response message
     */
    _generateBlockedResponse(chainResult) {
        const blockedBy = chainResult.blockedBy || 'security policy';
        return `Request blocked by ${blockedBy}. Please modify your request and try again.`;
    }

    /**
     * Generate an error response message
     * @param {string} error - The error message
     * @returns {string} Error response message
     */
    _generateErrorResponse(error) {
        return `Sorry, there was an error processing your request: ${error}`;
    }

    /**
     * Set the send chain
     * @param {SendChain} sendChain - Send chain to use
     */
    setSendChain(sendChain) {
        this.sendChain = sendChain;
        this.lastModified = new Date();
    }

    /**
     * Set the receive chain
     * @param {ReceiveChain} receiveChain - Receive chain to use
     */
    setReceiveChain(receiveChain) {
        this.receiveChain = receiveChain;
        this.lastModified = new Date();
    }

    /**
     * Set the LLM backend
     * @param {object} llmBackend - LLM backend configuration
     */
    setLLMBackend(llmBackend) {
        this.llmBackend = llmBackend;
        this.lastModified = new Date();
    }

    /**
     * Get detailed information about this injectionator
     * @returns {object} Complete injectionator details
     */
    getDetails() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            sourceUrl: this.sourceUrl,
            createdAt: this.createdAt,
            lastModified: this.lastModified,
            sendChain: this.sendChain ? this.sendChain.getDetails() : null,
            receiveChain: this.receiveChain ? this.receiveChain.getDetails() : null,
            llmBackend: this.llmBackend,
            isConfigured: this._isFullyConfigured()
        };
    }

    /**
     * Check if the injectionator is fully configured
     * @returns {boolean} True if ready to execute
     */
    _isFullyConfigured() {
        return this.sendChain !== null && this.receiveChain !== null && this.llmBackend !== null;
    }

    /**
     * Validate the injectionator configuration
     * @returns {object} Validation result
     */
    validate() {
        const issues = [];

        if (!this.sendChain) {
            issues.push('Send chain is not configured');
        }

        if (!this.receiveChain) {
            issues.push('Receive chain is not configured');
        }

        if (!this.llmBackend) {
            issues.push('LLM backend is not configured');
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * Create an Injectionator from JSON configuration
     * @param {object} config - JSON configuration object
     * @returns {Injectionator} New injectionator instance
     */
    static fromJSON(config) {
        // This would be implemented to reconstruct from injectionator.json
        // For now, return a basic instance
        return new Injectionator(
            config.name,
            config.description,
            config.sourceUrl
        );
    }

    /**
     * Export injectionator to JSON
     * @returns {object} JSON representation
     */
    toJSON() {
        return {
            name: this.name,
            description: this.description,
            sourceUrl: this.sourceUrl,
            sendChain: this.sendChain ? this.sendChain.getDetails() : null,
            receiveChain: this.receiveChain ? this.receiveChain.getDetails() : null,
            llmBackend: this.llmBackend,
            createdAt: this.createdAt,
            lastModified: this.lastModified
        };
    }
}
