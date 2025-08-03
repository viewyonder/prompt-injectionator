#!/bin/bash

# Prompt Injectionator Setup Script
# Usage: ./scripts/setup.sh

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

echo -e "${CYAN}🛡️  Prompt Injectionator Setup${NC}"
echo -e "${BLUE}Setting up development environment...${NC}"
echo ""

# Change to project directory
cd "$PROJECT_DIR"

# Check Node.js version
echo -e "${YELLOW}📋 Checking Node.js version...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "Node.js version: $NODE_VERSION"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check npm version
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "npm version: $NPM_VERSION"
else
    echo -e "${RED}❌ npm not found. Please install npm first.${NC}"
    exit 1
fi

echo ""

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo ""

# Create configs directory if it doesn't exist
if [ ! -d "configs" ]; then
    echo -e "${YELLOW}📁 Creating configs directory...${NC}"
    mkdir -p configs
fi

# Make scripts executable
echo -e "${YELLOW}🔧 Making scripts executable...${NC}"
chmod +x scripts/*.sh

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${CYAN}Available commands:${NC}"
echo -e "  ${GREEN}./scripts/cli.sh${NC}     - Launch interactive CLI"
echo -e "  ${GREEN}./scripts/demo.sh${NC}    - Run security demo"
echo -e "  ${GREEN}./scripts/test.sh${NC}    - Run tests"
echo -e "  ${GREEN}npm run cli${NC}          - Launch CLI (alternative)"
echo ""
echo -e "${YELLOW}Get started:${NC}"
echo -e "  ${BLUE}./scripts/demo.sh${NC}    - See the security system in action"
echo -e "  ${BLUE}./scripts/cli.sh${NC}     - Start the interactive CLI"
