# 🛡️ Prompt Injectionator Scripts

This directory contains helpful bash scripts to streamline development and usage of the Prompt Injectionator CLI.

## 🚀 Quick Start

### First Time Setup
```bash
./scripts/setup.sh
```

### Launch the CLI
```bash
./scripts/cli.sh
```

### See Security in Action
```bash
./scripts/demo.sh
```

## 📋 Available Scripts

### 🔧 `setup.sh` - Development Setup
Sets up the development environment with all dependencies.

**Usage:**
```bash
./scripts/setup.sh
```

**What it does:**
- ✅ Checks Node.js and npm versions
- 📦 Installs all npm dependencies
- 📁 Creates `configs` directory if needed
- 🔧 Makes all scripts executable
- 📋 Shows available commands

### 🎯 `cli.sh` - CLI Launcher
Launches the interactive Prompt Injectionator CLI.

**Usage:**
```bash
./scripts/cli.sh
```

**What it does:**
- 🛡️ Displays welcome message
- 📦 Auto-installs dependencies if missing
- 🚀 Launches the interactive CLI

**Alternative:** `npm run cli`

### 🎪 `demo.sh` - Security Demo
Runs a comprehensive demonstration of the security system.

**Usage:**
```bash
./scripts/demo.sh
```

**What it demonstrates:**
- 📦 Creating injectionators from templates
- ✅ Normal prompts passing through security
- 🚫 Injection attempts being blocked
- 💾 Save/load configuration functionality

### 🧪 `test.sh` - Test Runner
Runs the complete test suite.

**Usage:**
```bash
./scripts/test.sh
```

**What it does:**
- 📦 Auto-installs dependencies if missing
- 🧪 Runs Jest test suite
- ✅ Reports test results

### 🛠️ `dev.sh` - Development Helper
Multi-purpose development helper with various commands.

**Usage:**
```bash
./scripts/dev.sh [command]
```

**Available commands:**
- `setup` - Set up development environment
- `cli` - Launch interactive CLI
- `demo` - Run security demonstration
- `test` - Run test suite
- `clean` - Clean generated files
- `status` - Show project status
- `help` - Show help message

**Examples:**
```bash
./scripts/dev.sh status    # Check project status
./scripts/dev.sh demo      # Run demo
./scripts/dev.sh clean     # Clean generated files
```

## 📊 Script Features

### 🎨 Colored Output
All scripts use colored output for better readability:
- 🔵 **Blue**: Information messages
- 🟡 **Yellow**: Warnings and prompts
- 🟢 **Green**: Success messages
- 🔴 **Red**: Error messages
- 🔷 **Cyan**: Headers and titles

### 🔄 Auto-Dependency Management
Scripts automatically:
- Check for required dependencies
- Install missing npm packages
- Create necessary directories
- Make scripts executable

### 🛡️ Error Handling
All scripts include:
- `set -e` for immediate error exit
- Proper error messages
- Graceful fallbacks

## 🎯 Common Workflows

### 🆕 New Developer Setup
```bash
# Clone the repository
git clone <repository-url>
cd prompt-injectionator

# Set up everything
./scripts/setup.sh

# See it in action
./scripts/demo.sh

# Start using the CLI
./scripts/cli.sh
```

### 🔧 Development Workflow
```bash
# Check project status
./scripts/dev.sh status

# Run tests
./scripts/dev.sh test

# Clean up generated files
./scripts/dev.sh clean

# Launch CLI for testing
./scripts/dev.sh cli
```

### 🎪 Demo Workflow
```bash
# Run the automated demo
./scripts/demo.sh

# Then try the interactive CLI
./scripts/cli.sh
```

## 📁 Script Directory Structure

```
scripts/
├── README.md          # This file
├── setup.sh          # Development environment setup
├── cli.sh            # CLI launcher
├── demo.sh           # Security demonstration
├── test.sh           # Test runner
└── dev.sh            # Multi-purpose development helper
```

## 🔧 Requirements

### System Requirements
- **Node.js** (v14 or higher recommended)
- **npm** (comes with Node.js)
- **Bash** (available on macOS/Linux)

### Dependencies (Auto-installed)
- `inquirer` - Interactive CLI prompts
- `chalk` - Colored terminal output
- `ora` - Loading spinners
- `boxen` - Terminal boxes
- `table` - Data tables
- `@google/generative-ai` - Gemini integration
- `jest` - Testing framework

## 🚨 Troubleshooting

### Script Not Executable
```bash
chmod +x scripts/*.sh
```

### Dependencies Missing
```bash
./scripts/setup.sh
```

### Node.js Not Found
Install Node.js from [nodejs.org](https://nodejs.org/) or use a package manager:
```bash
# macOS with Homebrew
brew install node

# Check installation
node --version
npm --version
```

### Permission Denied
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Or run with bash explicitly
bash scripts/cli.sh
```

## 💡 Tips

### 🎯 Quick Commands
- **Just want to try it?** → `./scripts/demo.sh`
- **Ready to use the CLI?** → `./scripts/cli.sh`
- **Setting up for development?** → `./scripts/setup.sh`
- **Need help?** → `./scripts/dev.sh help`

### 🔄 Aliases (Optional)
Add to your shell profile (`.zshrc`, `.bashrc`):
```bash
alias pi-cli="./scripts/cli.sh"
alias pi-demo="./scripts/demo.sh"
alias pi-setup="./scripts/setup.sh"
```

### 🎨 Script Customization
Scripts are designed to be:
- ✅ Self-contained
- ✅ Error-resistant
- ✅ Easy to modify
- ✅ Well-documented

Feel free to customize them for your specific workflow!

## 🎉 What's Next?

After running the scripts:

1. **Try the Demo** (`./scripts/demo.sh`)
   - See security detection in action
   - Watch injection attempts get blocked
   - Understand the system capabilities

2. **Use the CLI** (`./scripts/cli.sh`)
   - Create your own injectionators
   - Test different prompts
   - Explore all features interactively

3. **Explore the Code**
   - Check out `src/cli/` for CLI implementation
   - Look at templates in `ConfigurationManager.js`
   - Understand the security pipeline

**Happy prompt injection testing!** 🛡️✨
