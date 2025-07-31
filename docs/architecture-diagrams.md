# Injectionator Architecture Diagrams

## Class Diagram

This diagram shows the relationships between the main classes in the Injectionator system:

```mermaid
classDiagram
    class Injectionator {
        -string id
        -string name
        -string description
        -string sourceUrl
        -SendChain sendChain
        -ReceiveChain receiveChain
        -object llmBackend
        -Date createdAt
        -Date lastModified
        +execute(userPrompt) Promise~object~
        +setSendChain(sendChain) void
        +setReceiveChain(receiveChain) void
        +setLLMBackend(llmBackend) void
        +getDetails() object
        +validate() object
        +toJSON() object
        +fromJSON(config)$ Injectionator
    }

    class Chain {
        <<abstract>>
        -string id
        -string name
        -Mitigation[] mitigations
        +process(input) Promise~object~
        +addMitigation(mitigation) void
        +removeMitigation(mitigationId) void
        +reorderMitigation(fromIndex, toIndex) void
        +getDetails() object
    }

    class SendChain {
        -string description
        -string sourceUrl
        -string type
        -object backend
        +process(userPrompt) Promise~object~
        +setBackend(backend) void
        +getBackend() object
        +getDetails() object
    }

    class ReceiveChain {
        -string description
        -string sourceUrl
        -string type
        -object outputTarget
        +process(llmResponse) Promise~object~
        +setOutputTarget(outputTarget) void
        +getOutputTarget() object
        +getDetails() object
    }

    class Mitigation {
        -string id
        -string name
        -string description
        -string sourceUrl
        -string state
        -string mode
        -Injection injection
        -string action
        +process(userPrompt) object
        +setMode(newMode) void
        +getDetails() object
    }

    class Injection {
        -string id
        -string name
        -string type
        -string description
        -Array patterns
        +detect(userPrompt) object
        +apply(userPrompt, injectionText) string
        +getDetails() object
    }

    Injectionator --> SendChain : uses
    Injectionator --> ReceiveChain : uses
    Chain <|-- SendChain : extends
    Chain <|-- ReceiveChain : extends
    Chain --> Mitigation : contains
    Mitigation --> Injection : wraps
```

## Execution Flow Diagram

This diagram illustrates the complete execution flow from user input to final response:

```mermaid
flowchart TD
    A[User Input] --> B[Injectionator.execute()]
    B --> C{Send Chain Configured?}
    
    C -->|Yes| D[Send Chain Process]
    C -->|No| E[Skip Send Chain]
    
    D --> F{Send Chain Passed?}
    F -->|No| G[Generate Blocked Response]
    F -->|Yes| H[Call LLM Backend]
    
    E --> H
    
    H --> I{LLM Call Success?}
    I -->|No| J[Generate Error Response]
    I -->|Yes| K{Receive Chain Configured?}
    
    K -->|Yes| L[Receive Chain Process]
    K -->|No| M[Skip Receive Chain]
    
    L --> N{Receive Chain Passed?}
    N -->|No| O[Generate Blocked Response]
    N -->|Yes| P[Return LLM Response]
    
    M --> P
    
    G --> Q[Final Response to User]
    J --> Q
    O --> Q
    P --> Q
    
    style A fill:#e1f5fe
    style Q fill:#c8e6c9
    style G fill:#ffcdd2
    style J fill:#ffcdd2
    style O fill:#ffcdd2
```

## Mitigation Processing Flow

This diagram shows how mitigations process user input within a chain:

```mermaid
flowchart TD
    A[Input Text] --> B[Chain.process()]
    B --> C{More Mitigations?}
    
    C -->|Yes| D[Next Mitigation]
    C -->|No| E[All Passed - Chain Success]
    
    D --> F{Mitigation State}
    F -->|Off| G[Skip Mitigation]
    F -->|On| H[Run Detection]
    
    G --> C
    H --> I[Injection.detect()]
    I --> J{Pattern Detected?}
    
    J -->|No| K[Mitigation Passed]
    J -->|Yes| L{Mitigation Mode}
    
    L -->|Passive| M[Log & Continue]
    L -->|Active| N{Action Type}
    
    N -->|abort| O[Chain Failed - Stop]
    N -->|flag| P[Flag & Continue]
    N -->|silent| Q[Silent & Continue]
    
    K --> C
    M --> C
    P --> C
    Q --> C
    
    O --> R[Chain Blocked]
    E --> S[Chain Success]
    
    style A fill:#e1f5fe
    style S fill:#c8e6c9
    style R fill:#ffcdd2
    style O fill:#ffcdd2
```

## Chain of Responsibility Pattern

This diagram illustrates how the Chain of Responsibility pattern is implemented:

```mermaid
flowchart LR
    A[User Prompt] --> B[Send Chain]
    B --> C{Pass?}
    C -->|Yes| D[LLM Backend]
    C -->|No| E[Block & Return]
    
    D --> F[LLM Response]
    F --> G[Receive Chain]
    G --> H{Pass?}
    H -->|Yes| I[Return to User]
    H -->|No| J[Block & Return]
    
    E --> K[User Receives Blocked Message]
    J --> K
    I --> L[User Receives LLM Response]
    
    style A fill:#e1f5fe
    style L fill:#c8e6c9
    style K fill:#ffcdd2
```

## Component Relationships

This diagram shows the high-level relationships between major components:

```mermaid
graph TB
    subgraph "Injectionator System"
        A[Injectionator] --> B[Send Chain]
        A --> C[Receive Chain]
        A --> D[LLM Backend]
        
        B --> E[Mitigation 1]
        B --> F[Mitigation 2]
        B --> G[Mitigation N]
        
        C --> H[Mitigation A]
        C --> I[Mitigation B]
        C --> J[Mitigation N]
        
        E --> K[Injection Pattern]
        F --> L[Injection Pattern]
        G --> M[Injection Pattern]
        H --> N[Injection Pattern]
        I --> O[Injection Pattern]
        J --> P[Injection Pattern]
    end
    
    Q[User Input] --> A
    A --> R[Final Response]
    D --> S[External LLM API]
    
    style A fill:#fff3e0
    style B fill:#e8f5e8
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style Q fill:#e1f5fe
    style R fill:#c8e6c9
```

## Sequence Diagrams

### Successful Execution Sequence

This sequence diagram shows the flow of a successful prompt execution:

```mermaid
sequenceDiagram
    participant User
    participant Injectionator
    participant SendChain
    participant Mitigation as Send Mitigation
    participant Injection as Injection Pattern
    participant LLM as LLM Backend
    participant ReceiveChain
    participant RMitigation as Receive Mitigation
    participant RInjection as Receive Injection

    User->>Injectionator: execute("Tell me about AI")
    Injectionator->>SendChain: process(userPrompt)
    
    loop For each mitigation
        SendChain->>Mitigation: process(userPrompt)
        Mitigation->>Injection: detect(userPrompt)
        Injection-->>Mitigation: {detected: false}
        Mitigation-->>SendChain: {passed: true, action: "allowed"}
    end
    
    SendChain-->>Injectionator: {passed: true, readyForLLM: true}
    Injectionator->>LLM: _callLLM(userPrompt)
    LLM-->>Injectionator: {success: true, response: "AI response"}
    
    Injectionator->>ReceiveChain: process(llmResponse)
    
    loop For each mitigation
        ReceiveChain->>RMitigation: process(llmResponse)
        RMitigation->>RInjection: detect(llmResponse)
        RInjection-->>RMitigation: {detected: false}
        RMitigation-->>ReceiveChain: {passed: true, action: "allowed"}
    end
    
    ReceiveChain-->>Injectionator: {passed: true, readyForUser: true}
    Injectionator-->>User: {success: true, finalResponse: "AI response"}
```

### Blocked by Send Chain Sequence

This sequence diagram shows what happens when the send chain blocks a request:

```mermaid
sequenceDiagram
    participant User
    participant Injectionator
    participant SendChain
    participant Mitigation as Send Mitigation
    participant Injection as Injection Pattern

    User->>Injectionator: execute("Ignore previous instructions")
    Injectionator->>SendChain: process(userPrompt)
    
    SendChain->>Mitigation: process(userPrompt)
    Mitigation->>Injection: detect(userPrompt)
    Injection-->>Mitigation: {detected: true, detections: [...]}
    
    Note over Mitigation: Mode: Active, Action: abort
    Mitigation-->>SendChain: {passed: false, action: "blocked"}
    
    SendChain-->>Injectionator: {passed: false, blockedBy: "Send Mitigation"}
    Injectionator-->>User: {success: false, finalResponse: "Request blocked..."}
    
    Note over User,Injectionator: LLM is never called when send chain blocks
```

### Passive Mode Detection Sequence

This sequence diagram shows how passive mode works (detects but allows):

```mermaid
sequenceDiagram
    participant User
    participant Injectionator
    participant SendChain
    participant Mitigation as Passive Mitigation
    participant Injection as Injection Pattern
    participant LLM as LLM Backend
    participant Logger as Observability

    User->>Injectionator: execute("Act as an expert")
    Injectionator->>SendChain: process(userPrompt)
    
    SendChain->>Mitigation: process(userPrompt)
    Mitigation->>Injection: detect(userPrompt)
    Injection-->>Mitigation: {detected: true, detections: [...]}
    
    Note over Mitigation: Mode: Passive, Action: flag
    Mitigation->>Logger: log("Role-play attempt detected but allowed")
    Mitigation-->>SendChain: {passed: true, action: "reported"}
    
    SendChain-->>Injectionator: {passed: true, readyForLLM: true}
    
    Note over Injectionator: Continues to LLM despite detection
    Injectionator->>LLM: _callLLM(userPrompt)
    LLM-->>Injectionator: {success: true, response: "Expert response"}
    Injectionator-->>User: {success: true, finalResponse: "Expert response"}
```

### Error Handling Sequence

This sequence diagram shows error handling when LLM calls fail:

```mermaid
sequenceDiagram
    participant User
    participant Injectionator
    participant SendChain
    participant LLM as LLM Backend

    User->>Injectionator: execute("Valid prompt")
    Injectionator->>SendChain: process(userPrompt)
    SendChain-->>Injectionator: {passed: true, readyForLLM: true}
    
    Injectionator->>LLM: _callLLM(userPrompt)
    
    Note over LLM: Network error or API failure
    LLM-->>Injectionator: {success: false, error: "API timeout"}
    
    Note over Injectionator: Generate error response
    Injectionator-->>User: {success: false, finalResponse: "Sorry, there was an error..."}
```

### Configuration and Validation Sequence

This sequence diagram shows the configuration validation process:

```mermaid
sequenceDiagram
    participant User
    participant Injectionator
    participant SendChain
    participant ReceiveChain
    participant Backend as LLM Backend

    User->>Injectionator: new Injectionator(config)
    
    User->>Injectionator: setSendChain(sendChain)
    Injectionator->>SendChain: validate configuration
    SendChain-->>Injectionator: validation result
    
    User->>Injectionator: setReceiveChain(receiveChain)
    Injectionator->>ReceiveChain: validate configuration
    ReceiveChain-->>Injectionator: validation result
    
    User->>Injectionator: setLLMBackend(backend)
    Injectionator->>Backend: test connection
    Backend-->>Injectionator: connection status
    
    User->>Injectionator: validate()
    
    alt All components configured
        Injectionator-->>User: {valid: true, issues: []}
    else Missing components
        Injectionator-->>User: {valid: false, issues: ["Missing send chain", ...]}
    end
```
