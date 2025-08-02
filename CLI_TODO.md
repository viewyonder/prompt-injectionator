# Interactive CLI Development TODO

Based on [GitHub Issue #7](https://github.com/viewyonder/prompt-injectionator/issues/7)

## Phase 1: Core CLI Infrastructure ✅

- [x] Set up CLI project structure in `src/cli/`
- [x] Create main CLI application class (`PromptInjectionatorCLI.js`)
- [x] Implement basic menu system and navigation
- [x] Add session management for tracking state (`CLISession.js`)
- [x] Install CLI dependencies (inquirer, chalk, ora, boxen, table)
- [x] Create CLI entry point (`src/cli/index.js`)
- [x] Add npm script for running CLI (`npm run cli`)

## Phase 2: Basic Operations 🚧

### Core Components
- [x] **ConfigurationManager.js** - Handle config file operations
- [ ] **MitigationManager.js** - Manage mitigation chains  
- [ ] **BackendManager.js** - Handle backend switching
- [ ] **LogWatcher.js** - Real-time log monitoring

### Core Functionality
- [ ] Create injectionator creation flow (templates, blank)
- [ ] Implement configuration loading and saving
- [ ] Add basic execution functionality
- [ ] Create status display and formatting
- [ ] Integrate with existing InjectionatorFactory

## Phase 3: Advanced Features 📋

### Mitigation Management
- [ ] Build mitigation management interface
- [ ] Add/remove mitigations from chains
- [ ] Reorder mitigations in chains
- [ ] Enable/disable specific mitigations

### Backend Management
- [ ] Implement backend switching (OpenAI, Gemini, Mock, etc.)
- [ ] Backend configuration management
- [ ] Connection testing and validation

### Logging and History
- [ ] Add log watching and history viewing
- [ ] Live log streaming
- [ ] Log search functionality
- [ ] Session history and replay

### Configuration Management
- [ ] Create settings and configuration management
- [ ] Configuration validation
- [ ] Configuration templates
- [ ] Import/export functionality

## Phase 4: Polish and Testing 📋

### Error Handling & UX
- [ ] Add comprehensive error handling
- [ ] Graceful error messages
- [ ] Progress indicators for long operations
- [ ] Colored output and syntax highlighting

### Testing
- [ ] Create unit tests for CLI components
- [ ] Create integration tests for end-to-end workflows
- [ ] Test configuration loading/saving
- [ ] Test execution flows

### Documentation
- [ ] Add comprehensive documentation
- [ ] Create help system within CLI
- [ ] Usage examples and tutorials
- [ ] CLI command reference

### Performance & Optimization
- [ ] Performance optimization
- [ ] UX improvements based on testing
- [ ] Memory usage optimization
- [ ] Startup time optimization

## User Stories Progress

### Core Functionality
- [ ] **Create Injectionators**: Users can create new injectionators from templates, blank configurations, or custom setups
- [ ] **Load/Save Configurations**: Users can load existing JSON configurations and save current configurations to files
- [ ] **Execute Injectionators**: Users can run prompts through configured injectionators and see formatted results
- [ ] **Manage Mitigations**: Users can attach, detach, enable/disable, and reorder mitigations in chains
- [ ] **Swap Backends**: Users can switch between different LLM backends (OpenAI, Gemini, Mock, etc.)
- [ ] **Live Log Watching**: Users can view real-time logs and execution history
- [ ] **Configuration Management**: Users can browse, validate, and manage configuration files

### User Experience Features
- [x] **Interactive Menus**: Intuitive menu-driven interface using inquirer.js
- [x] **Status Display**: Clear display of current injectionator status and configuration
- [x] **Progress Indicators**: Loading spinners and progress bars for long operations
- [x] **Colored Output**: Syntax highlighting and color-coded status messages
- [ ] **Error Handling**: Graceful error handling with helpful error messages
- [x] **Session Management**: Track execution history and maintain session state

## MVP Acceptance Criteria

- [ ] Users can create injectionators from templates
- [ ] Users can load and save configuration files
- [ ] Users can execute prompts and see formatted results
- [ ] Users can view current configuration status
- [ ] Basic error handling and user feedback

## Enhanced Features Acceptance Criteria

- [ ] Full mitigation management (add/remove/reorder)
- [ ] Backend switching with configuration
- [ ] Live log watching and search
- [ ] Configuration validation and templates
- [ ] Session history and replay

## Definition of Done

- [ ] All core functionality implemented and tested
- [x] CLI can be run with `npm run cli`
- [ ] Comprehensive documentation provided
- [ ] Unit tests cover critical functionality
- [ ] Integration tests validate end-to-end workflows
- [ ] Code follows project coding standards
- [ ] PR reviewed and approved by maintainers

## Current Status

**Completed**: 
- ✅ Basic CLI infrastructure and main application class
- ✅ Session management with history tracking
- ✅ CLI entry point and npm integration
- ✅ Dependencies installed and configured
- ✅ ConfigurationManager for file operations, templates, and validation

**In Progress**: 
- 🚧 Building core supporting modules (ConfigurationManager, MitigationManager, etc.)

**Next Priority**: 
1. ✅ Create `ConfigurationManager.js` for handling config file operations
2. Create `MitigationManager.js` for managing mitigation chains
3. Create `BackendManager.js` for backend switching
4. Create `LogWatcher.js` for real-time log monitoring

**Estimated Progress**: ~30% complete (Phase 1 done, Phase 2 in progress - ConfigurationManager complete)

## Next Immediate Tasks

Based on our current progress, the next immediate tasks are:

1. **ConfigurationManager.js** - This should handle:
   - Loading configurations from JSON files
   - Saving configurations to files
   - Configuration validation
   - Configuration templates
   - Integration with InjectionatorFactory

2. **MitigationManager.js** - This should handle:
   - Managing mitigation chains
   - Adding/removing mitigations
   - Reordering mitigation chains
   - Enabling/disabling mitigations

3. **BackendManager.js** - This should handle:
   - Backend discovery and registration
   - Backend switching
   - Backend configuration
   - Connection testing

4. **LogWatcher.js** - This should handle:
   - Real-time log monitoring
   - Log filtering and search
   - Log formatting for CLI display
   - Integration with CLI session logging
