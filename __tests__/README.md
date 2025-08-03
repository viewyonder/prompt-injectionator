# CLI Test Suite

This directory contains comprehensive tests for both the JavaScript and Bash implementations of the Prompt Injectionator CLI.

## Test Structure

```
__tests__/
├── bash/                    # Bash CLI tests (using BATS)
│   └── cli-bash.bats       # Tests for scripts/cli.sh
├── e2e/                    # End-to-end workflow tests
│   └── cli-workflows.test.js # Complete user workflow simulations
├── integration/            # Integration tests
│   └── cli-integration.test.js # CLI feature integration tests
└── unit/                   # Unit tests (existing)
    ├── CLISession.test.js
    ├── ConfigurationManager.test.js
    └── ...
```

## Test Categories

### 1. Unit Tests
Located in `__tests__/unit/`, these test individual classes and components:
- **CLISession.test.js**: Tests session management, execution logging, statistics
- **ConfigurationManager.test.js**: Tests configuration loading, saving, templates

### 2. Integration Tests
Located in `__tests__/integration/cli-integration.test.js`, these test CLI features:
- **Create Feature**: Template creation, blank creation, error handling
- **Load Feature**: Configuration loading, file scanning, validation
- **Save Feature**: Configuration saving, file path suggestions
- **Execute Feature**: Prompt execution, success/failure handling, detailed output
- **Session Management**: History viewing, session info, statistics
- **Error Handling**: Graceful error recovery, user continuation prompts
- **Menu Navigation**: Option enabling/disabling based on state

### 3. End-to-End Workflow Tests
Located in `__tests__/e2e/cli-workflows.test.js`, these simulate complete user workflows:
- **Create → Execute**: Full workflow from creation to prompt execution
- **Create → Save → Load**: Configuration persistence workflow
- **Error Recovery**: Handling failures and retrying operations
- **Multiple Executions**: Testing various prompt outcomes and history
- **Configuration Management**: Validation, viewing, exporting configurations

### 4. Bash CLI Tests
Located in `__tests__/bash/cli-bash.bats`, these test the bash launcher script:
- Script existence and permissions
- Environment setup and detection
- Dependency management (npm install)
- Process launching and signal handling
- Color output and messaging
- Error conditions and recovery

## Running Tests

### All CLI Tests
```bash
npm run test:cli
# or
./scripts/test-cli.sh
```

### Individual Test Suites
```bash
# JavaScript Integration Tests
npm run test:cli-integration

# End-to-End Workflow Tests  
npm run test:cli-e2e

# Bash CLI Tests (requires BATS)
npm run test:cli-bash

# All existing unit tests
npm test
```

### Prerequisites

**For JavaScript Tests:**
- Node.js and npm installed
- Dependencies installed (`npm install`)

**For Bash Tests:**
- BATS (Bash Automated Testing System) installed
  - macOS: `brew install bats-core`
  - npm: `npm install -g bats`
  - GitHub: https://github.com/bats-core/bats-core

The test runner script will attempt to install BATS automatically if not found.

## Test Features

### Mocking Strategy
- **inquirer**: Mocked to simulate user input sequences
- **File System**: Mocked to avoid actual file operations during testing
- **Console**: Mocked to capture and verify output messages
- **Dependencies**: External dependencies mocked for controlled testing

### User Interaction Simulation
Tests simulate realistic user interactions:
```javascript
mockPrompt
  .mockResolvedValueOnce({ action: 'create' })          // Select create
  .mockResolvedValueOnce({ creationType: 'template' })   // Choose template
  .mockResolvedValueOnce({ name: 'test', description: 'Test' }) // Enter details
  .mockResolvedValueOnce({ template: 'blank' })          // Select template
  .mockResolvedValueOnce({ continue: '' })               // Press enter
  .mockResolvedValueOnce({ action: 'exit' });            // Exit
```

### Error Condition Testing
Tests verify proper error handling:
- Invalid templates or configurations
- File system errors
- Network failures
- User cancellation
- Invalid input validation

### State Management Testing
Tests verify proper state management:
- Menu options enabled/disabled based on active injectionator
- Session persistence across operations
- History and statistics tracking
- Cleanup on exit

## Test Data

Tests use consistent mock data:
- **Session IDs**: `test-uuid-12345`
- **Configuration Names**: Descriptive names like `workflow-test`, `retry-test`
- **File Paths**: `./configs/test-config.json` patterns
- **Execution Results**: Varied success/failure scenarios

## Continuous Integration

The test suite is designed to run in CI environments:
- No external dependencies required (mocked)
- Deterministic results with consistent mock data
- Proper cleanup of temporary resources
- Clear pass/fail reporting with detailed error messages

## Extending Tests

### Adding New CLI Features
1. Add unit tests for new classes/methods
2. Add integration tests for new CLI menu options
3. Add workflow tests for complete user scenarios
4. Update bash tests if launcher script changes

### Test Patterns
Follow these patterns when adding tests:

**Unit Tests:**
```javascript
describe('NewFeature', () => {
  it('should handle basic operation', () => {
    // Test basic functionality
  });
  
  it('should handle error conditions', () => {
    // Test error scenarios
  });
});
```

**Integration Tests:**
```javascript
describe('New CLI Feature', () => {
  it('should perform feature operation', async () => {
    mockPrompt
      .mockResolvedValueOnce({ action: 'new-feature' })
      .mockResolvedValueOnce({ /* user input */ })
      .mockResolvedValueOnce({ action: 'exit' });
    
    // Mock dependencies
    // Run CLI
    // Verify behavior
  });
});
```

**Workflow Tests:**
```javascript
describe('New Workflow', () => {
  it('should complete end-to-end scenario', async () => {
    // Mock complete user journey
    // Verify all steps execute correctly
    // Check final state
  });
});
```

This comprehensive test suite ensures the reliability and usability of both CLI implementations across all supported features and user scenarios.
