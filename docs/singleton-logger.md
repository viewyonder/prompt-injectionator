# Singleton Logger Implementation

The Logger has been refactored to use the Singleton pattern for centralized logging across all components in the Prompt Injectionator system.

## Key Features

### 1. Singleton Pattern
- **Single Instance**: All classes share the same Logger instance
- **Centralized Configuration**: Configure once at application startup
- **Memory Efficient**: No multiple logger instances consuming memory
- **Consistent Behavior**: Same logging behavior across all components

### 2. Context-Aware Logging
- **Component Context**: Each component gets its own context (e.g., `Injectionator:MyBot`, `Chain:SecurityChain`)
- **Hierarchical Context**: Support for nested contexts (e.g., `App:UserService`, `Backend:LLM:OpenAI`)
- **Context Preservation**: Log entries maintain their originating component context

### 3. Structured JSON Logging
- **Machine Readable**: All logs are output as structured JSON
- **Rich Metadata**: Includes timestamp, session ID, context, elapsed time, and custom data
- **Integration Ready**: Easy to pipe to monitoring systems like ELK, Splunk, or CloudWatch

### 4. Console Output
- **STDOUT**: INFO and DEBUG messages are sent to standard output
- **STDERR**: WARN and ERROR messages are sent to standard error
- **JSON Format**: All logs are structured JSON for easy parsing
- **Container Friendly**: Works well with Docker and container orchestration

### 5. Environment-Based Configuration
Configure the logger using environment variables:

```bash
# Set log level (DEBUG, INFO, WARN, ERROR)
export LOGGER_LEVEL=INFO
```

## Usage Examples

### Basic Usage in Components

```javascript
import logger from '../src/core/Logger.js';

class MyComponent {
    constructor(name) {
        this.name = name;
        // Get a context-aware logger for this component
        this.logger = logger.withContext(`MyComponent:${this.name}`);
    }

    doSomething() {
        this.logger.info('Performing operation', {
            operation: 'data_processing',
            recordCount: 100
        });
    }
}
```

### Using Child Loggers

```javascript
const appLogger = logger.withContext('Application');
const userServiceLogger = appLogger.child('UserService');

userServiceLogger.info('User authenticated', { userId: 12345 });
// Results in context: "Application:UserService"
```

### Structured Logging with Metadata

```javascript
logger.info('API request completed', {
    method: 'POST',
    endpoint: '/api/users',
    statusCode: 201,
    responseTime: 150,
    userId: 12345
});
```

### Convenience Methods for Common Events

```javascript
// Execution tracking
logger.startExecution('DataProcessor', { batchSize: 1000 });
logger.endExecution('DataProcessor', 'SUCCESS', { processedCount: 1000 });

// Backend calls
logger.backendCall('OpenAI-GPT4', 250, { tokens: 150, cost: 0.003 });

// Hook results
logger.hookResult('SecurityValidation', 'PASS', 25, { rulesChecked: 8 });
```

## Configuration Examples

### Development Environment
```bash
LOGGER_LEVEL=DEBUG node app.js
```

### Production Environment
```bash
LOGGER_LEVEL=WARN node app.js
```

### Docker Container
```dockerfile
ENV LOGGER_LEVEL=INFO
```

### Redirecting Output
```bash
# Redirect all logs to a file
node app.js > app.log 2>&1

# Separate INFO/DEBUG and WARN/ERROR logs
node app.js > info.log 2> error.log

# Send to syslog
node app.js 2>&1 | logger -t injectionator
```

## Log Entry Structure

Each log entry is a JSON object with the following structure:

```json
{
  "timestamp": "2025-08-01T09:57:01.228Z",
  "sessionId": "session-1754042221214-9vimr7lwg",
  "level": "INFO",
  "context": "Injectionator:SecurityBot",
  "message": "Request processed successfully",
  "elapsed": 156,
  "requestId": "req-abc123",
  "userId": 12345,
  "processingTime": 150,
  "event": "request_processed"
}
```

### Standard Fields
- `timestamp`: ISO 8601 timestamp
- `sessionId`: Unique session identifier
- `level`: Log level (DEBUG, INFO, WARN, ERROR)
- `context`: Component context
- `message`: Human-readable message
- `elapsed`: Milliseconds since logger startup

### Custom Fields
Any additional data passed to logging methods is included as additional fields in the JSON object.

## Migration from Previous Logger

### Before (Multiple Instances)
```javascript
// Each class created its own logger
class MyClass {
    constructor() {
        this.logger = new Logger({ context: 'MyClass' });
    }
}
```

### After (Singleton with Context)
```javascript
// All classes use the same logger instance with context
import logger from './Logger.js';

class MyClass {
    constructor() {
        this.logger = logger.withContext('MyClass');
    }
}
```

## Benefits

1. **Centralized Configuration**: Configure logging once for the entire application
2. **Memory Efficiency**: Single logger instance instead of multiple instances
3. **Consistent Session Tracking**: All logs share the same session ID
4. **Enhanced Observability**: Structured JSON logs with rich metadata
5. **Performance**: Optional async queue for high-throughput scenarios
6. **Flexibility**: Environment-based configuration for different deployment scenarios
7. **Integration Ready**: Structured format works with modern logging infrastructure

## Testing

The singleton logger maintains compatibility with existing tests while providing enhanced functionality:

```javascript
import logger, { Logger } from './Logger.js';

// Verify singleton behavior
const logger1 = new Logger();
const logger2 = new Logger();
console.log(logger1 === logger2); // true

// Test with context
const testLogger = logger.withContext('Test');
testLogger.enableCollection();
testLogger.info('Test message');
console.log(testLogger.getLogs()); // Array of log entries
```

## Monitoring Integration

The structured JSON format makes it easy to integrate with monitoring systems:

### ELK Stack
```bash
# Filter and forward ERROR logs to Elasticsearch
node app.js 2>&1 | jq -c 'select(.level == "ERROR")' | \
  curl -X POST "elasticsearch:9200/logs/_doc" -H "Content-Type: application/json" -d @-

# Using Filebeat with console output
node app.js > /var/log/injectionator.log 2>&1
# Then configure Filebeat to read from /var/log/injectionator.log
```

### Docker Logging
```dockerfile
# Docker automatically captures STDOUT/STDERR
CMD ["node", "app.js"]

# Use logging drivers
docker run --log-driver=json-file --log-opt max-size=10m app
docker run --log-driver=fluentd --log-opt fluentd-address=localhost:24224 app
```

### CloudWatch (AWS)
```bash
# Using AWS CLI to send logs to CloudWatch
node app.js 2>&1 | aws logs put-log-events \
  --log-group-name "/aws/injectionator" \
  --log-stream-name "$(date +%Y%m%d)" \
  --log-events timestamp=$(date +%s000),message="$(cat)"
```

### Kubernetes
```yaml
# Kubernetes automatically collects pod logs from STDOUT/STDERR
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: injectionator
    image: injectionator:latest
    env:
    - name: LOGGER_LEVEL
      value: "INFO"
```

## Demo

Run the included demo to see the singleton logger in action:

```bash
node demo/singleton-logger-demo.js

# With environment configuration
LOGGER_LEVEL=DEBUG node demo/singleton-logger-demo.js
```
