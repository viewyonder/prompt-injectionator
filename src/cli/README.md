# Interactive CLI for Prompt Injectionator

This directory contains the interactive command-line interface for managing Prompt Injectionators.

## Architecture Overview

The CLI is built using a modular architecture with the following components:

### Core Classes

- **`PromptInjectionatorCLI.js`** - Main CLI application controller
- **`CLISession.js`** - Session management and state tracking
- **`ConfigurationManager.js`** - Configuration file operations
- **`MitigationManager.js`** - Mitigation chain management
- **`BackendManager.js`** - Backend switching and configuration
- **`LogWatcher.js`** - Real-time log monitoring

### Dependencies

- `inquirer` - Interactive command line prompts
- `chalk` - Terminal color styling  
- `ora` - Loading spinners
- `boxen` - Terminal boxes for formatted output
- `table` - ASCII table formatting

## Features

### ✅ Implemented
- [ ] Core CLI structure
- [ ] Main menu system
- [ ] Session management
- [ ] Injectionator creation (template/blank)
- [ ] Configuration loading/saving
- [ ] Prompt execution with formatted results
- [ ] Status display

### 🚧 In Progress
- [ ] Mitigation management
- [ ] Backend switching
- [ ] Log watching

### 📋 Planned
- [ ] Configuration validation
- [ ] Settings management
- [ ] Help system
- [ ] Template browsing
- [ ] Session history

## Usage

```bash
# Run the CLI
node src/cli/index.js

# Or if installed globally
prompt-injectionator-cli
```

## Development

### Adding New Features

1. Create feature branch from `feature/interactive-cli`
2. Implement the feature in the appropriate module
3. Add tests in `__tests__/cli/`
4. Update this README
5. Submit PR for review

### Code Style

- Use ES6 modules
- Follow existing error handling patterns
- Use chalk for consistent color coding
- Add spinner feedback for async operations
- Validate user input with inquirer

### Testing

```bash
# Run CLI tests
npm test -- __tests__/cli/

# Test specific module
npm test -- __tests__/cli/CLISession.test.js
```

## File Structure

```
src/cli/
├── README.md                    # This file
├── index.js                     # CLI entry point
├── PromptInjectionatorCLI.js    # Main application
├── CLISession.js                # Session management
├── ConfigurationManager.js      # Config operations
├── MitigationManager.js         # Mitigation management
├── BackendManager.js            # Backend management
├── LogWatcher.js                # Log monitoring
└── utils/
    ├── colors.js                # Color constants
    ├── formatters.js            # Output formatting
    └── validators.js            # Input validation
```

## Integration

The CLI integrates with existing core classes:

- Uses `InjectionatorFactory` for config management
- Leverages `Injectionator`, `Chain`, `Mitigation` classes
- Maintains compatibility with JSON configuration format
- Extends existing logging infrastructure

## Error Handling

- Graceful error recovery with user-friendly messages
- Validation at input level with inquirer
- Comprehensive error logging
- Option to continue or exit after errors
