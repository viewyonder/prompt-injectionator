import logger from './Logger.js';

/**
 * Base Backend class that all backend implementations extend
 */
export class Backend {
    constructor(name, type, config = {}) {
        this.name = name || 'Default Backend';
        this.type = type || 'generic';
        this.config = config;
        this.id = crypto.randomUUID();
        this.createdAt = new Date();
        
        // Initialize logger with context
        this.logger = logger.withContext(`${this.type}:${this.name}`);
        
        this.logger.info('Backend created', {
            name: this.name,
            id: this.id,
            type: this.type,
            event: 'backend_created'
        });
    }

    /**
     * Process a user prompt - to be implemented by subclasses
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} Backend response result
     */
    async process(userPrompt) {
        throw new Error('Backend.process() must be implemented by subclass');
    }

    /**
     * Get detailed information about this backend
     * @returns {object} Complete backend details
     */
    getDetails() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            config: this.config,
            createdAt: this.createdAt
        };
    }

    /**
     * Validate the backend configuration
     * @returns {object} Validation result
     */
    validate() {
        return {
            valid: true,
            issues: []
        };
    }
}

/**
 * LLM Backend mockup - simulates calling a Large Language Model API
 */
export class LLMBackend extends Backend {
    constructor(name = 'LLM Backend', config = {}) {
        super(name, 'llm', {
            provider: 'mockup',
            model: 'mock-gpt-4',
            apiUrl: 'https://api.mockup.com/v1/chat/completions',
            maxTokens: 1000,
            temperature: 0.7,
            ...config
        });
    }

    /**
     * Process user prompt through LLM
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} LLM response result
     */
    async process(userPrompt) {
        try {
            const startTime = Date.now();
            this.logger.info('Processing user prompt', {
                event: 'llm_process_start',
                promptLength: userPrompt.length
            });
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 200));

            const processingTime = Date.now() - startTime;
            
            const result = {
                success: true,
                response: "I'm only a mockup, not a real boy",
                metadata: {
                    backend: this.name,
                    type: this.type,
                    provider: this.config.provider,
                    model: this.config.model,
                    tokens: userPrompt.length,
                    processingTime: processingTime,
                    prompt: userPrompt
                }
            };
            
            this.logger.info('Processing completed', {
                event: 'llm_process_end',
                processingTime: processingTime
            });

            return result;
        } catch (error) {
            this.logger.error('Processing failed', {
                event: 'llm_process_error',
                error: error.message
            });
            return {
                success: false,
                error: error.message,
                metadata: {
                    backend: this.name,
                    type: this.type
                }
            };
        }
    }

    /**
     * Validate LLM backend configuration
     * @returns {object} Validation result
     */
    validate() {
        const issues = [];
        
        if (!this.config.provider) {
            issues.push('LLM provider is required');
        }
        
        if (!this.config.model) {
            issues.push('LLM model is required');
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

/**
 * Webhook Backend mockup - simulates calling a webhook endpoint
 */
export class WebhookBackend extends Backend {
    constructor(name = 'Webhook Backend', config = {}) {
        super(name, 'webhook', {
            url: 'https://api.mockup.com/webhook',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer mock-token'
            },
            timeout: 5000,
            ...config
        });
    }

    /**
     * Process user prompt through webhook
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} Webhook response result
     */
    async process(userPrompt) {
        try {
            const startTime = Date.now();
            this.logger.info('Processing user prompt', {
                event: 'webhook_process_start',
                promptLength: userPrompt.length
            });
            
            // Simulate webhook call delay
            await new Promise(resolve => setTimeout(resolve, 150));

            const processingTime = Date.now() - startTime;
            
            const result = {
                success: true,
                response: "I'm only a mockup, not a real boy",
                metadata: {
                    backend: this.name,
                    type: this.type,
                    webhookUrl: this.config.url,
                    method: this.config.method,
                    processingTime: processingTime,
                    prompt: userPrompt,
                    statusCode: 200
                }
            };
            
            this.logger.info('Processing completed', {
                event: 'webhook_process_end',
                processingTime: processingTime
            });

            return result;
        } catch (error) {
            this.logger.error('Processing failed', {
                event: 'webhook_process_error',
                error: error.message
            });
            return {
                success: false,
                error: error.message,
                metadata: {
                    backend: this.name,
                    type: this.type,
                    webhookUrl: this.config.url
                }
            };
        }
    }

    /**
     * Validate webhook backend configuration
     * @returns {object} Validation result
     */
    validate() {
        const issues = [];
        
        if (!this.config.url) {
            issues.push('Webhook URL is required');
        }
        
        if (!this.config.method) {
            issues.push('HTTP method is required');
        }

        // Basic URL validation
        if (this.config.url && !this.config.url.startsWith('http')) {
            issues.push('Webhook URL must be a valid HTTP/HTTPS URL');
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

/**
 * ChatBot Backend mockup - simulates a chatbot service
 */
export class ChatBotBackend extends Backend {
    constructor(name = 'ChatBot Backend', config = {}) {
        super(name, 'chatbot', {
            botId: 'mock-bot-123',
            apiUrl: 'https://api.mockup.com/chatbot',
            personality: 'helpful',
            language: 'en',
            contextWindow: 4000,
            ...config
        });
    }

    /**
     * Process user prompt through chatbot
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} ChatBot response result
     */
    async process(userPrompt) {
        try {
            const startTime = Date.now();
            this.logger.info('Processing user prompt', {
                event: 'chatbot_process_start',
                promptLength: userPrompt.length
            });
            
            // Simulate chatbot processing delay
            await new Promise(resolve => setTimeout(resolve, 300));

            const processingTime = Date.now() - startTime;
            
            const result = {
                success: true,
                response: "I'm only a mockup, not a real boy",
                metadata: {
                    backend: this.name,
                    type: this.type,
                    botId: this.config.botId,
                    personality: this.config.personality,
                    language: this.config.language,
                    processingTime: processingTime,
                    prompt: userPrompt,
                    conversationId: 'conv-' + Date.now()
                }
            };
            
            this.logger.info('Processing completed', {
                event: 'chatbot_process_end',
                processingTime: processingTime
            });

            return result;
        } catch (error) {
            this.logger.error('Processing failed', {
                event: 'chatbot_process_error',
                error: error.message
            });
            return {
                success: false,
                error: error.message,
                metadata: {
                    backend: this.name,
                    type: this.type,
                    botId: this.config.botId
                }
            };
        }
    }

    /**
     * Validate chatbot backend configuration
     * @returns {object} Validation result
     */
    validate() {
        const issues = [];
        
        if (!this.config.botId) {
            issues.push('Bot ID is required');
        }
        
        if (!this.config.apiUrl) {
            issues.push('ChatBot API URL is required');
        }

        // Basic URL validation
        if (this.config.apiUrl && !this.config.apiUrl.startsWith('http')) {
            issues.push('ChatBot API URL must be a valid HTTP/HTTPS URL');
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

/**
 * Agent2Agent (A2A) Backend - simulates agent-to-agent communication
 * Used for multi-agent systems where agents communicate with each other
 */
export class Agent2AgentBackend extends Backend {
    constructor(name = 'Agent2Agent Backend', config = {}) {
        super(name, 'a2a', {
            agentId: 'agent-' + Date.now(),
            targetAgentId: 'target-agent-123',
            communicationProtocol: 'json-rpc',
            endpointUrl: 'https://api.mockup.com/a2a/communicate',
            authToken: 'mock-a2a-token',
            messageFormat: 'structured',
            capabilities: ['reasoning', 'planning', 'execution'],
            maxRetries: 3,
            timeout: 10000,
            ...config
        });
    }

    /**
     * Process user prompt through agent-to-agent communication
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} A2A response result
     */
    async process(userPrompt) {
        try {
            const startTime = Date.now();
            this.logger.info('Processing user prompt via A2A', {
                event: 'a2a_process_start',
                promptLength: userPrompt.length,
                targetAgent: this.config.targetAgentId
            });
            
            // Simulate A2A communication delay (longer due to multi-agent coordination)
            await new Promise(resolve => setTimeout(resolve, 400));

            const processingTime = Date.now() - startTime;
            
            const result = {
                success: true,
                response: "I'm only a mockup A2A backend, coordinating with other agents",
                metadata: {
                    backend: this.name,
                    type: this.type,
                    agentId: this.config.agentId,
                    targetAgentId: this.config.targetAgentId,
                    protocol: this.config.communicationProtocol,
                    messageFormat: this.config.messageFormat,
                    capabilities: this.config.capabilities,
                    processingTime: processingTime,
                    prompt: userPrompt,
                    conversationId: 'a2a-conv-' + Date.now(),
                    agentChain: ['initiator', this.config.targetAgentId, 'response']
                }
            };
            
            this.logger.info('A2A processing completed', {
                event: 'a2a_process_end',
                processingTime: processingTime,
                targetAgent: this.config.targetAgentId
            });

            return result;
        } catch (error) {
            this.logger.error('A2A processing failed', {
                event: 'a2a_process_error',
                error: error.message,
                targetAgent: this.config.targetAgentId
            });
            return {
                success: false,
                error: error.message,
                metadata: {
                    backend: this.name,
                    type: this.type,
                    agentId: this.config.agentId,
                    targetAgentId: this.config.targetAgentId
                }
            };
        }
    }

    /**
     * Validate A2A backend configuration
     * @returns {object} Validation result
     */
    validate() {
        const issues = [];
        
        if (!this.config.agentId) {
            issues.push('Agent ID is required');
        }
        
        if (!this.config.targetAgentId) {
            issues.push('Target Agent ID is required');
        }
        
        if (!this.config.endpointUrl) {
            issues.push('A2A endpoint URL is required');
        }
        
        if (!this.config.communicationProtocol) {
            issues.push('Communication protocol is required');
        }

        // Validate endpoint URL format
        if (this.config.endpointUrl && !this.config.endpointUrl.startsWith('http')) {
            issues.push('A2A endpoint URL must be a valid HTTP/HTTPS URL');
        }

        // Validate protocol
        const validProtocols = ['json-rpc', 'rest', 'grpc', 'websocket'];
        if (this.config.communicationProtocol && !validProtocols.includes(this.config.communicationProtocol)) {
            issues.push(`Communication protocol must be one of: ${validProtocols.join(', ')}`);
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

/**
 * MCP (Model Context Protocol) Backend - simulates MCP-compliant communication
 * Used for standardized context sharing and model interaction protocols
 */
export class MCPBackend extends Backend {
    constructor(name = 'MCP Backend', config = {}) {
        super(name, 'mcp', {
            mcpVersion: '1.0',
            serverId: 'mcp-server-' + Date.now(),
            clientId: 'mcp-client-' + Date.now(),
            transportType: 'stdio', // stdio, websocket, http
            contextWindowSize: 8192,
            maxTokens: 4096,
            capabilities: {
                resources: true,
                tools: true,
                prompts: true,
                logging: true
            },
            resources: [
                { name: 'filesystem', type: 'file_operations' },
                { name: 'web_search', type: 'search_api' }
            ],
            tools: [
                { name: 'calculator', description: 'Perform mathematical calculations' },
                { name: 'code_executor', description: 'Execute code snippets' }
            ],
            endpointUrl: 'https://api.mockup.com/mcp',
            timeout: 8000,
            ...config
        });
    }

    /**
     * Process user prompt through MCP protocol
     * @param {string} userPrompt - The user's input text
     * @returns {Promise<object>} MCP response result
     */
    async process(userPrompt) {
        try {
            const startTime = Date.now();
            this.logger.info('Processing user prompt via MCP', {
                event: 'mcp_process_start',
                promptLength: userPrompt.length,
                mcpVersion: this.config.mcpVersion,
                serverId: this.config.serverId
            });
            
            // Simulate MCP protocol handshake and processing
            await new Promise(resolve => setTimeout(resolve, 350));

            const processingTime = Date.now() - startTime;
            
            const result = {
                success: true,
                response: "I'm only a mockup MCP backend, following Model Context Protocol standards",
                metadata: {
                    backend: this.name,
                    type: this.type,
                    mcpVersion: this.config.mcpVersion,
                    serverId: this.config.serverId,
                    clientId: this.config.clientId,
                    transportType: this.config.transportType,
                    contextWindowSize: this.config.contextWindowSize,
                    capabilities: this.config.capabilities,
                    availableResources: this.config.resources,
                    availableTools: this.config.tools,
                    processingTime: processingTime,
                    prompt: userPrompt,
                    sessionId: 'mcp-session-' + Date.now(),
                    protocolMessages: [
                        { type: 'initialize', status: 'completed' },
                        { type: 'resources/list', status: 'completed' },
                        { type: 'prompts/get', status: 'completed' },
                        { type: 'completion/complete', status: 'completed' }
                    ]
                }
            };
            
            this.logger.info('MCP processing completed', {
                event: 'mcp_process_end',
                processingTime: processingTime,
                mcpVersion: this.config.mcpVersion
            });

            return result;
        } catch (error) {
            this.logger.error('MCP processing failed', {
                event: 'mcp_process_error',
                error: error.message,
                mcpVersion: this.config.mcpVersion
            });
            return {
                success: false,
                error: error.message,
                metadata: {
                    backend: this.name,
                    type: this.type,
                    mcpVersion: this.config.mcpVersion,
                    serverId: this.config.serverId,
                    clientId: this.config.clientId
                }
            };
        }
    }

    /**
     * Validate MCP backend configuration
     * @returns {object} Validation result
     */
    validate() {
        const issues = [];
        
        if (!this.config.mcpVersion) {
            issues.push('MCP version is required');
        }
        
        if (!this.config.serverId) {
            issues.push('MCP server ID is required');
        }
        
        if (!this.config.clientId) {
            issues.push('MCP client ID is required');
        }
        
        if (!this.config.transportType) {
            issues.push('MCP transport type is required');
        }

        // Validate transport type
        const validTransports = ['stdio', 'websocket', 'http', 'tcp'];
        if (this.config.transportType && !validTransports.includes(this.config.transportType)) {
            issues.push(`Transport type must be one of: ${validTransports.join(', ')}`);
        }

        // Validate context window size
        if (this.config.contextWindowSize && (this.config.contextWindowSize < 1024 || this.config.contextWindowSize > 32768)) {
            issues.push('Context window size must be between 1024 and 32768');
        }

        // Validate capabilities structure
        if (this.config.capabilities && typeof this.config.capabilities !== 'object') {
            issues.push('Capabilities must be an object');
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// Export default for backward compatibility
export default Backend;
