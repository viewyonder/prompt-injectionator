import logger from './Logger.js';
import { Injection } from './Injection.js';
import { SendChain, ReceiveChain } from './Chain.js';
import { LLMBackend } from '../backends/LLMBackend.js';
import { Mitigation } from './Mitigation.js';
import apiKeyManager from './ApiKeyManager.js';

// Parse CLI arguments to register API keys
apiKeyManager.parseCliArguments(process.argv);

/**
 * Injectionator class orchestrates the complete flow using Chain of Responsibility pattern
 * Flow: userPrompt -43e sendChain -43e LLM -43e receiveChain -43e user
 */
export class Injectionator {
    constructor(name, description, sourceUrl, sendChain, receiveChain, llmBackend, customLogger = null) {
        this.name = name || 'Default Injectionator';
        this.description = description || 'Processes prompts through security chains and LLM';
        this.sourceUrl = sourceUrl || null;
        this.sendChain = sendChain || null;
        this.receiveChain = receiveChain || null;
        this.llmBackend = llmBackend || null;
        this.id = crypto.randomUUID();
        this.createdAt = new Date();
        this.lastModified = new Date();
        
        // Initialize logger with context
        this.logger = customLogger ? customLogger : logger.withContext(`Injectionator:${this.name}`);
        
        this.logger.info('Injectionator created', {
            name: this.name,
            id: this.id,
            event: 'injectionator_created'
        });
    }

    /**
     * Execute the complete injectionator flow
     * @param {string} userPrompt - The user's input text
     * @returns {object} Complete execution result
     */
    async execute(userPrompt) {
        const startTime = Date.now();
        this.logger.startExecution('Injectionator', {
            userPrompt: userPrompt.substring(0, 100) + (userPrompt.length > 100 ? '...' : ''),
            promptLength: userPrompt.length
        });
        
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
                this.logger.info('Processing through send chain', {
                    chainName: this.sendChain.name,
                    event: 'send_chain_start'
                });
                
                const sendResult = await this.sendChain.process(userPrompt);
                executionResult.steps.push({
                    step: 'send_chain',
                    chainName: this.sendChain.name,
                    result: sendResult,
                    timestamp: new Date()
                });

                if (!sendResult.passed) {
                    this.logger.warn('Request blocked by send chain', {
                        chainName: this.sendChain.name,
                        blockedBy: sendResult.blockedBy,
                        event: 'execution_blocked'
                    });
                    executionResult.blockedAt = 'send_chain';
                    executionResult.finalResponse = this._generateBlockedResponse(sendResult);
                    executionResult.endTime = new Date();
                    return executionResult;
                }
                
                this.logger.info('Send chain passed', {
                    chainName: this.sendChain.name,
                    event: 'send_chain_passed'
                });
            }

            // Step 2: Call LLM Backend
            if (this.llmBackend) {
                this.logger.info('Calling backend', {
                    backendType: this.llmBackend.constructor.name,
                    event: 'backend_call_start'
                });
                
                const backendStartTime = Date.now();
                const llmResult = await this._callLLM(userPrompt);
                const backendProcessingTime = Date.now() - backendStartTime;
                
                this.logger.backendCall(
                    this.llmBackend.constructor.name,
                    backendProcessingTime,
                    { success: llmResult.success }
                );
                
                executionResult.steps.push({
                    step: 'llm_backend',
                    backendName: this.llmBackend.name || 'Unknown LLM',
                    result: llmResult,
                    timestamp: new Date()
                });

                if (!llmResult.success) {
                    this.logger.error('Backend call failed', {
                        error: llmResult.error,
                        backendType: this.llmBackend.constructor.name,
                        event: 'backend_error'
                    });
                    executionResult.error = llmResult.error;
                    executionResult.blockedAt = 'llm_backend';
                    executionResult.finalResponse = this._generateErrorResponse(llmResult.error);
                    executionResult.endTime = new Date();
                    return executionResult;
                }

                // Step 3: Process LLM response through Receive Chain
                if (this.receiveChain) {
                    this.logger.info('Processing through receive chain', {
                        chainName: this.receiveChain.name,
                        event: 'receive_chain_start'
                    });
                    
                    const receiveResult = await this.receiveChain.process(llmResult.response);
                    executionResult.steps.push({
                        step: 'receive_chain',
                        chainName: this.receiveChain.name,
                        result: receiveResult,
                        timestamp: new Date()
                    });

                    if (!receiveResult.passed) {
                        this.logger.warn('Response blocked by receive chain', {
                            chainName: this.receiveChain.name,
                            blockedBy: receiveResult.blockedBy,
                            event: 'execution_blocked'
                        });
                        executionResult.blockedAt = 'receive_chain';
                        executionResult.finalResponse = this._generateBlockedResponse(receiveResult);
                        executionResult.endTime = new Date();
                        return executionResult;
                    }
                    
                    this.logger.info('Receive chain passed', {
                        chainName: this.receiveChain.name,
                        event: 'receive_chain_passed'
                    });
                }

                // Success - all chains passed
                executionResult.success = true;
                executionResult.finalResponse = llmResult.response;
                
                const totalProcessingTime = Date.now() - startTime;
                this.logger.endExecution('Injectionator', 'SUCCESS', {
                    processingTime: totalProcessingTime,
                    responseLength: llmResult.response ? llmResult.response.length : 0
                });
            } else {
                throw new Error('No LLM backend configured');
            }

        } catch (error) {
            this.logger.error('Execution failed with exception', {
                error: error.message,
                stack: error.stack,
                event: 'execution_error'
            });
            executionResult.error = error.message;
            executionResult.finalResponse = this._generateErrorResponse(error.message);
        }

        executionResult.endTime = new Date();
        return executionResult;
    }

    /**
     * Call the configured backend to process the user prompt
     * @param {string} prompt - The user prompt to send to backend
     * @returns {object} Backend response result
     */
    async _callLLM(prompt) {
        try {
            if (!this.llmBackend) {
                throw new Error('No backend configured');
            }

            // Use the backend's process method
            const result = await this.llmBackend.process(prompt);
            return result;
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
        // Construct injections
        const injections = Object.fromEntries(
            Object.entries(config.injections).map(([key, injectionConfig]) => [key, Injection.fromJSON(injectionConfig)])
        );

        // Construct mitigations for chains
        const constructMitigations = (chainConfig, pipelineType) =>
            chainConfig.mitigations.map((mitConfig) => new Mitigation({
                name: mitConfig.name,
                description: mitConfig.description,
                sourceUrl: null,
                injections: [injections[mitConfig.injection]],
                state: 'On',
                mode: 'Active',
                action: 'abort',
                pipeline: pipelineType
            }));

        // Construct send chain
        const sendChain = new SendChain(
            config.sendChain.name,
            config.sendChain.description,
            config.sendChain.sourceUrl,
            null, // backend will be set separately
            constructMitigations(config.sendChain, 'send')
        );

        // Construct receive chain
        const receiveChain = new ReceiveChain(
            config.receiveChain.name,
            config.receiveChain.description,
            config.receiveChain.sourceUrl,
            config.receiveChain.outputTarget,
            constructMitigations(config.receiveChain, 'receive')
        );

        // Construct backend
        const backend = new LLMBackend(config.backend.name, config.backend);

        // Construct Injectionator
        return new Injectionator(
            config.name,
            config.description,
            config.sourceUrl,
            sendChain,
            receiveChain,
            backend
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
            sendChain: this.sendChain ? this.sendChain.toJSON() : null,
            receiveChain: this.receiveChain ? this.receiveChain.toJSON() : null,
            backend: this.llmBackend ? this.llmBackend.toJSON() : null,
            injections: this._extractInjectionsFromChains()
        };
    }

    /**
     * Extract unique injections from chains
     * @returns {object} Mapped injections
     */
    _extractInjectionsFromChains() {
        const uniqueInjections = {};

        const processMitigations = (mitigations) => {
            mitigations.forEach((mitigation) => {
                const { name, injections } = mitigation;
                if (injections && injections.length > 0) {
                    injections.forEach((injection) => {
                        if (injection && !uniqueInjections[name]) {
                            uniqueInjections[name] = injection.toJSON();
                        }
                    });
                }
            });
        };

        if (this.sendChain) {
            processMitigations(this.sendChain.mitigations);
        }
        if (this.receiveChain) {
            processMitigations(this.receiveChain.mitigations);
        }

        return uniqueInjections;
    }
}
