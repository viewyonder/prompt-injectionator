# Injectionator Prototyping

## Key Features

### 1. **Complete Flow Orchestration**
```
userPrompt → sendChain → LLM Backend → receiveChain → finalResponse
```

### 2. **Chain of Responsibility Implementation**
- Each step can either pass control to the next step or halt execution
- If any chain blocks the request, execution stops immediately
- Clear tracking of where execution was blocked

### 3. **Comprehensive Execution Tracking**
- Records each step with timestamps
- Tracks success/failure at each stage
- Provides detailed execution results with metadata

### 4. **Error Handling & User Feedback**
- Generates appropriate user messages for blocked requests
- Handles LLM API errors gracefully
- Provides clear error messages

### 5. **Configuration Management**
- Easy setup and modification of chains and backends
- Validation to ensure complete configuration
- JSON import/export capabilities

## Usage Example

```javascript
// Create chains with mitigations
const sendChain = new SendChain(
    'Security Chain',
    'Validates prompts for security issues',
    'https://github.com/company/security',
    { provider: 'openai', url: 'https://api.openai.com/v1/chat/completions' },
    [securityMitigation, piiMitigation]
);

const receiveChain = new ReceiveChain(
    'Response Filter',
    'Filters LLM responses',
    'https://github.com/company/response-filters',
    { type: 'user_interface' },
    [contentMitigation]
);

// Create and configure injectionator
const injectionator = new Injectionator(
    'Production Injectionator',
    'Secure LLM interaction system',
    'https://github.com/company/injectionator'
);

injectionator.setSendChain(sendChain);
injectionator.setReceiveChain(receiveChain);
injectionator.setLLMBackend({ 
    provider: 'openai', 
    name: 'GPT-4',
    url: 'https://api.openai.com/v1/chat/completions' 
});

// Execute with user prompt
const result = await injectionator.execute('Tell me about AI safety');
console.log(result.finalResponse); // Either LLM response or blocked message
```

## Execution Flow Results

The `execute()` method returns a comprehensive result object:

```javascript
{
    injectionatorId: "uuid",
    injectionatorName: "Production Injectionator",
    userPrompt: "Tell me about AI safety",
    startTime: Date,
    endTime: Date,
    success: true/false,
    finalResponse: "Final response to user",
    steps: [
        { step: 'send_chain', result: {...}, timestamp: Date },
        { step: 'llm_backend', result: {...}, timestamp: Date },
        { step: 'receive_chain', result: {...}, timestamp: Date }
    ],
    blockedAt: null or 'send_chain'/'receive_chain'/'llm_backend',
    error: null or "error message"
}
```
