#!/usr/bin/env bats

# Bash CLI Test Suite
# Tests the bash CLI launcher script for proper behavior

setup() {
    # Get project directory relative to test location
    export PROJECT_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"
    export SCRIPTS_DIR="$PROJECT_DIR/scripts"
    export CLI_SCRIPT="$SCRIPTS_DIR/cli.sh"
    
    # Create temporary directory for test files
    export TEST_TEMP_DIR="$(mktemp -d)"
    
    # Mock npm command for testing
    export PATH="$TEST_TEMP_DIR:$PATH"
    
    # Create mock npm that doesn't actually install/run
    cat > "$TEST_TEMP_DIR/npm" << 'EOF'
#!/bin/bash
case "$1" in
    "install")
        echo "Mock npm install completed"
        mkdir -p node_modules
        exit 0
        ;;
    "run")
        if [ "$2" = "cli" ]; then
            echo "Mock CLI started"
            echo "Welcome to Prompt Injectionator CLI"
            echo "Session started successfully"
            exit 0
        fi
        ;;
    *)
        echo "npm $*"
        exit 0
        ;;
esac
EOF
    chmod +x "$TEST_TEMP_DIR/npm"
}

teardown() {
    # Clean up temporary directory
    rm -rf "$TEST_TEMP_DIR"
}

@test "CLI script exists and is executable" {
    [ -f "$CLI_SCRIPT" ]
    [ -x "$CLI_SCRIPT" ]
}

@test "CLI script has correct shebang" {
    run head -1 "$CLI_SCRIPT"
    [ "$output" = "#!/bin/bash" ]
}

@test "CLI script sets error handling" {
    run grep "set -e" "$CLI_SCRIPT"
    [ "$status" -eq 0 ]
}

@test "CLI script detects script directory correctly" {
    # Test that the script can determine its own directory
    run bash -c 'source "$CLI_SCRIPT" 2>/dev/null; echo "$SCRIPT_DIR"' || true
    # Should not be empty if sourced correctly
    [ -n "$output" ]
}

@test "CLI script changes to project directory" {
    # Create a temporary script that mimics the directory change logic
    cat > "$TEST_TEMP_DIR/test_cd.sh" << 'EOF'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"
pwd
EOF
    chmod +x "$TEST_TEMP_DIR/test_cd.sh"
    
    run "$TEST_TEMP_DIR/test_cd.sh"
    [ "$status" -eq 0 ]
    # Output should be a valid directory path
    [ -d "$output" ]
}

@test "CLI script checks for node_modules and installs if missing" {
    # Change to project directory for this test
    cd "$PROJECT_DIR"
    
    # Remove node_modules if it exists (for clean test)
    if [ -d "node_modules" ]; then
        mv node_modules node_modules.backup
    fi
    
    # Run the CLI script (should trigger npm install)
    run timeout 10s "$CLI_SCRIPT" || true
    
    # Restore node_modules if we backed it up
    if [ -d "node_modules.backup" ]; then
        mv node_modules.backup node_modules
    fi
    
    # Check that npm install was called
    echo "$output" | grep -q "npm install\|Installing\|Mock npm install"
}

@test "CLI script runs npm run cli when node_modules exists" {
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Ensure node_modules exists (create mock if needed)
    if [ ! -d "node_modules" ]; then
        mkdir -p node_modules
        CREATED_MOCK_MODULES=true
    fi
    
    # Run the CLI script
    run timeout 10s "$CLI_SCRIPT" || true
    
    # Clean up mock node_modules if we created it
    if [ "$CREATED_MOCK_MODULES" = "true" ]; then
        rm -rf node_modules
    fi
    
    # Check that npm run cli was executed
    echo "$output" | grep -q "npm run cli\|Mock CLI started\|Launching CLI"
}

@test "CLI script displays welcome message" {
    cd "$PROJECT_DIR"
    
    # Run the CLI script and capture output
    run timeout 5s "$CLI_SCRIPT" || true
    
    # Check for welcome message components
    echo "$output" | grep -q "Prompt Injectionator CLI\|🛡️"
}

@test "CLI script displays startup messages" {
    cd "$PROJECT_DIR"
    
    run timeout 5s "$CLI_SCRIPT" || true
    
    # Check for startup sequence messages
    echo "$output" | grep -q "Starting interactive CLI\|Launching CLI\|🚀"
}

@test "CLI script handles missing dependencies gracefully" {
    cd "$PROJECT_DIR"
    
    # Temporarily hide node_modules if it exists
    if [ -d "node_modules" ]; then
        mv node_modules node_modules.hidden
    fi
    
    run timeout 10s "$CLI_SCRIPT" || true
    
    # Restore node_modules
    if [ -d "node_modules.hidden" ]; then
        mv node_modules.hidden node_modules
    fi
    
    # Should show dependency installation message
    echo "$output" | grep -q "Dependencies not found\|Installing\|⚠️"
}

@test "CLI script uses exec for final npm run cli command" {
    # Check that the script uses exec to replace the shell process
    run grep "exec npm run cli" "$CLI_SCRIPT"
    [ "$status" -eq 0 ]
}

@test "CLI script color codes are defined" {
    # Check that color variables are defined
    run grep "RED=" "$CLI_SCRIPT"
    [ "$status" -eq 0 ]
    
    run grep "GREEN=" "$CLI_SCRIPT"
    [ "$status" -eq 0 ]
    
    run grep "CYAN=" "$CLI_SCRIPT"
    [ "$status" -eq 0 ]
    
    run grep "NC=" "$CLI_SCRIPT"
    [ "$status" -eq 0 ]
}

@test "CLI script outputs are colorized" {
    cd "$PROJECT_DIR"
    
    run timeout 5s "$CLI_SCRIPT" || true
    
    # Check that output contains ANSI color codes
    echo "$output" | grep -q $'\033\['
}

@test "CLI script can be run from different directories" {
    # Test running from a different directory
    cd "$TEST_TEMP_DIR"
    
    run timeout 5s "$CLI_SCRIPT" || true
    
    # Should still work and show appropriate messages
    [ "$status" -ne 127 ]  # Not "command not found"
}

@test "CLI script handles signals gracefully" {
    cd "$PROJECT_DIR"
    
    # Start the CLI script in background
    timeout 2s "$CLI_SCRIPT" &
    CLI_PID=$!
    
    sleep 0.5
    
    # Send SIGTERM
    kill -TERM "$CLI_PID" 2>/dev/null || true
    
    # Wait for process to finish
    wait "$CLI_PID" 2>/dev/null || true
    
    # Process should have exited cleanly
    ! kill -0 "$CLI_PID" 2>/dev/null
}

@test "CLI script validates project structure" {
    # The script should work when run from the correct project directory
    cd "$PROJECT_DIR"
    
    # Check that essential files exist
    [ -f "package.json" ]
    [ -d "src" ]
    [ -d "src/cli" ]
    [ -f "src/cli/index.js" ]
}

@test "CLI script can handle npm failures gracefully" {
    cd "$PROJECT_DIR"
    
    # Create a failing npm mock
    cat > "$TEST_TEMP_DIR/npm" << 'EOF'
#!/bin/bash
echo "npm: command failed"
exit 1
EOF
    chmod +x "$TEST_TEMP_DIR/npm"
    
    # Run should fail but not crash
    run timeout 5s "$CLI_SCRIPT" || true
    
    # Exit code should indicate failure
    [ "$status" -ne 0 ]
}
