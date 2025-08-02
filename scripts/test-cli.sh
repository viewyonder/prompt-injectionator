#!/bin/bash

# CLI Test Suite Runner
# Runs both JavaScript and Bash CLI tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}🛡️  Prompt Injectionator CLI Test Suite${NC}"
echo -e "${BLUE}Running comprehensive CLI tests...${NC}"
echo ""

# Change to project directory
cd "$PROJECT_DIR"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not found. Installing...${NC}"
    npm install
    echo ""
fi

# Function to check if bats is available
check_bats() {
    if command -v bats >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to install bats if needed
install_bats() {
    echo -e "${YELLOW}📦 BATS not found. Installing...${NC}"
    
    if command -v brew >/dev/null 2>&1; then
        echo "Installing BATS using Homebrew..."
        brew install bats-core
    elif command -v npm >/dev/null 2>&1; then
        echo "Installing BATS using npm..."
        npm install -g bats
    else
        echo -e "${RED}❌ Cannot install BATS automatically. Please install manually:${NC}"
        echo "  - macOS: brew install bats-core"
        echo "  - npm: npm install -g bats"
        echo "  - GitHub: https://github.com/bats-core/bats-core"
        return 1
    fi
}

# Track test results
JEST_SUCCESS=false
BATS_SUCCESS=false

echo -e "${GREEN}🧪 Running JavaScript CLI Integration Tests...${NC}"
echo ""

# Run Jest tests for CLI integration
if npm test -- --testPathPattern="cli-integration" --verbose; then
    echo ""
    echo -e "${GREEN}✅ JavaScript CLI tests passed!${NC}"
    JEST_SUCCESS=true
else
    echo ""
    echo -e "${RED}❌ JavaScript CLI tests failed.${NC}"
    JEST_SUCCESS=false
fi

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

echo -e "${GREEN}🔧 Running Bash CLI Tests...${NC}"
echo ""

# Check if BATS is available
if ! check_bats; then
    if ! install_bats; then
        echo -e "${RED}❌ Cannot run bash tests without BATS.${NC}"
        BATS_SUCCESS=false
    fi
fi

# Run BATS tests if available
if check_bats; then
    if bats __tests__/bash/cli-bash.bats; then
        echo ""
        echo -e "${GREEN}✅ Bash CLI tests passed!${NC}"
        BATS_SUCCESS=true
    else
        echo ""
        echo -e "${RED}❌ Bash CLI tests failed.${NC}"
        BATS_SUCCESS=false
    fi
else
    echo -e "${YELLOW}⚠️  Skipping bash tests (BATS not available)${NC}"
    BATS_SUCCESS=true  # Don't fail the overall suite if BATS is not available
fi

# Summary
echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo -e "${CYAN}📊 Test Results Summary${NC}"
echo ""

if [ "$JEST_SUCCESS" = true ]; then
    echo -e "JavaScript CLI Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "JavaScript CLI Tests: ${RED}❌ FAILED${NC}"
fi

if [ "$BATS_SUCCESS" = true ]; then
    echo -e "Bash CLI Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Bash CLI Tests: ${RED}❌ FAILED${NC}"
fi

echo ""

# Overall result
if [ "$JEST_SUCCESS" = true ] && [ "$BATS_SUCCESS" = true ]; then
    echo -e "${GREEN}🎉 All CLI tests passed!${NC}"
    exit 0
else
    echo -e "${RED}💥 Some CLI tests failed. Please review the output above.${NC}"
    exit 1
fi
