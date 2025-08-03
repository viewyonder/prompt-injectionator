#!/bin/bash

# Prompt Injectionator Development Helper
# Usage: ./scripts/dev.sh [command]

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

show_help() {
    echo -e "${CYAN}🛡️  Prompt Injectionator Development Helper${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ./scripts/dev.sh [command]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}setup${NC}       - Set up development environment"
    echo -e "  ${GREEN}cli${NC}         - Launch interactive CLI"
    echo -e "  ${GREEN}demo${NC}        - Run security demonstration"
    echo -e "  ${GREEN}test${NC}        - Run test suite"
    echo -e "  ${GREEN}clean${NC}       - Clean generated files"
    echo -e "  ${GREEN}status${NC}      - Show project status"
    echo -e "  ${GREEN}help${NC}        - Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ./scripts/dev.sh setup    - Set up the project"
    echo -e "  ./scripts/dev.sh demo     - See security in action"
    echo -e "  ./scripts/dev.sh cli      - Start the CLI"
}

show_status() {
    echo -e "${CYAN}🛡️  Prompt Injectionator Status${NC}"
    echo ""
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "  ${GREEN}✅ Node.js:${NC} $NODE_VERSION"
    else
        echo -e "  ${RED}❌ Node.js:${NC} Not installed"
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo -e "  ${GREEN}✅ npm:${NC} $NPM_VERSION"
    else
        echo -e "  ${RED}❌ npm:${NC} Not installed"
    fi
    
    # Check dependencies
    cd "$PROJECT_DIR"
    if [ -d "node_modules" ]; then
        echo -e "  ${GREEN}✅ Dependencies:${NC} Installed"
    else
        echo -e "  ${YELLOW}⚠️  Dependencies:${NC} Not installed (run ./scripts/dev.sh setup)"
    fi
    
    # Check configs directory
    if [ -d "configs" ]; then
        CONFIG_COUNT=$(find configs -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
        echo -e "  ${GREEN}✅ Configs directory:${NC} $CONFIG_COUNT configuration files"
    else
        echo -e "  ${YELLOW}⚠️  Configs directory:${NC} Not found"
    fi
    
    echo ""
    echo -e "${YELLOW}Quick start:${NC}"
    echo -e "  ./scripts/dev.sh demo     - See the security system in action"
    echo -e "  ./scripts/dev.sh cli      - Start the interactive CLI"
}

clean_project() {
    echo -e "${CYAN}🛡️  Cleaning Project${NC}"
    echo ""
    
    cd "$PROJECT_DIR"
    
    # Remove generated config files (but keep directory)
    if [ -d "configs" ]; then
        echo -e "${YELLOW}🧹 Cleaning configs directory...${NC}"
        find configs -name "*.json" -delete 2>/dev/null || true
    fi
    
    # Remove demo files
    if [ -f "demo-security-tester.json" ]; then
        echo -e "${YELLOW}🧹 Removing demo files...${NC}"
        rm -f demo-security-tester.json
    fi
    
    echo -e "${GREEN}✅ Project cleaned!${NC}"
}

# Main command handling
case "${1:-help}" in
    "setup")
        exec "$SCRIPT_DIR/setup.sh"
        ;;
    "cli")
        exec "$SCRIPT_DIR/cli.sh"
        ;;
    "demo")
        exec "$SCRIPT_DIR/demo.sh"
        ;;
    "test")
        exec "$SCRIPT_DIR/test.sh"
        ;;
    "clean")
        clean_project
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        show_help
        ;;
esac
