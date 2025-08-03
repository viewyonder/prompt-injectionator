#!/bin/bash

# Prompt Injectionator CLI Launcher
# Usage: ./scripts/cli.sh

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

echo -e "${CYAN}🛡️  Prompt Injectionator CLI${NC}"
echo -e "${BLUE}Starting interactive CLI...${NC}"
echo ""

# Change to project directory
cd "$PROJECT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not found. Installing...${NC}"
    npm install
    echo ""
fi

# Run the CLI
echo -e "${GREEN}🚀 Launching CLI...${NC}"
echo ""
exec npm run cli
