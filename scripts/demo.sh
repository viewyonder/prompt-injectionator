#!/bin/bash

# Prompt Injectionator Demo Launcher
# Usage: ./scripts/demo.sh

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

echo -e "${CYAN}🛡️  Prompt Injectionator Demo${NC}"
echo -e "${BLUE}Running security demonstration...${NC}"
echo ""
echo -e "${YELLOW}This demo will show:${NC}"
echo -e "  • Creating injectionators from templates"
echo -e "  • Testing with normal prompts (should pass)"
echo -e "  • Testing with injection attempts (should be blocked)"
echo -e "  • Save/load configuration functionality"
echo ""

# Change to project directory
cd "$PROJECT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not found. Installing...${NC}"
    npm install
    echo ""
fi

# Run the demo
echo -e "${GREEN}🚀 Starting demo...${NC}"
echo ""
exec node demo_injectionator.js
