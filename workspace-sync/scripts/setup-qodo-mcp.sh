#!/bin/bash

# Setup script for Qodo Gen Enterprise MCP Server
# Multi-Hub Platform Development Environment

set -e

echo "🚀 Setting up Qodo Gen Enterprise MCP Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="g:/GITHUB REPOs/multi-hub-project"
MCP_CONFIG_DIR="$PROJECT_ROOT/.qodo"
SHARED_SERVICES_DIR="$PROJECT_ROOT/shared/services"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Install MCP SDK dependencies
install_mcp_dependencies() {
    print_status "Installing MCP SDK dependencies..."
    
    cd "$SHARED_SERVICES_DIR"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $SHARED_SERVICES_DIR"
        exit 1
    fi
    
    npm install
    print_success "MCP dependencies installed"
}

# Validate MCP configuration
validate_mcp_config() {
    print_status "Validating MCP configuration..."
    
    if [ ! -f "$MCP_CONFIG_DIR/mcp_config.json" ]; then
        print_error "MCP configuration file not found: $MCP_CONFIG_DIR/mcp_config.json"
        exit 1
    fi
    
    # Validate JSON syntax
    if ! python -m json.tool "$MCP_CONFIG_DIR/mcp_config.json" > /dev/null 2>&1; then
        print_error "Invalid JSON in MCP configuration file"
        exit 1
    fi
    
    print_success "MCP configuration is valid"
}

# Test MCP server
test_mcp_server() {
    print_status "Testing MCP server..."
    
    cd "$SHARED_SERVICES_DIR"
    
    # Set environment variables for testing
    export MULTI_HUB_PROJECT_ROOT="$PROJECT_ROOT"
    export QODO_GEN_MODE="enterprise"
    export ENABLE_TYPESCRIPT_PATTERNS="true"
    export ENABLE_REACT_ENTERPRISE="true"
    export ENABLE_GITHUB_ACTIONS="true"
    export ENABLE_NETLIFY_OPTIMIZATION="true"
    export ENABLE_SECURITY_FIRST="true"
    export ENABLE_ATOMIC_DEPLOYMENTS="true"
    
    # Test server startup (timeout after 5 seconds)
    timeout 5s node qodoGenMcpServer.js &
    SERVER_PID=$!
    
    sleep 2
    
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_success "MCP server started successfully"
        kill $SERVER_PID
    else
        print_error "MCP server failed to start"
        exit 1
    fi
}

# Create platform-specific configurations
create_platform_configs() {
    print_status "Creating platform-specific configurations..."
    
    PLATFORMS=("ai-models" "bolt-new" "qodo-gen" "hub-ui" "game-builder" "printer-builder" "ipa-builder" "api")
    
    for platform in "${PLATFORMS[@]}"; do
        PLATFORM_DIR="$PROJECT_ROOT/$platform"
        
        if [ -d "$PLATFORM_DIR" ]; then
            # Create .qodo directory in each platform
            mkdir -p "$PLATFORM_DIR/.qodo"
            
            # Create platform-specific MCP config
            cat > "$PLATFORM_DIR/.qodo/platform-config.json" << EOF
{
  "platform": "$platform",
  "mcpIntegration": {
    "enabled": true,
    "serverUrl": "stdio://shared/services/qodoGenMcpServer.js",
    "enterpriseMode": true
  },
  "features": {
    "typescript": true,
    "react": true,
    "security": true,
    "automation": true
  },
  "deployment": {
    "netlify": true,
    "githubPages": true,
    "atomic": true,
    "rollback": true
  }
}
EOF
            
            print_success "Created configuration for $platform"
        else
            print_warning "Platform directory not found: $platform"
        fi
    done
}

# Setup GitHub Actions integration
setup_github_actions() {
    print_status "Setting up GitHub Actions integration..."
    
    WORKFLOWS_DIR="$PROJECT_ROOT/.github/workflows"
    
    # Create MCP-aware workflow
    cat > "$WORKFLOWS_DIR/qodo-mcp-integration.yml" << 'EOF'
name: Qodo MCP Integration

on:
  workflow_dispatch:
    inputs:
      mcp_operation:
        description: 'MCP Operation to perform'
        required: true
        default: 'sync_repository_state'
        type: choice
        options:
          - sync_repository_state
          - generate_enterprise_component
          - setup_github_workflow
          - optimize_iframe_security
          - generate_documentation

jobs:
  mcp-operation:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install MCP dependencies
        run: |
          cd shared/services
          npm install
          
      - name: Execute MCP operation
        run: |
          cd shared/services
          export MULTI_HUB_PROJECT_ROOT="${{ github.workspace }}"
          export QODO_GEN_MODE="enterprise"
          echo "Executing MCP operation: ${{ github.event.inputs.mcp_operation }}"
          # MCP operation would be executed here via the server
          
      - name: Commit changes
        if: success()
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git commit -m "MCP Operation: ${{ github.event.inputs.mcp_operation }}" || exit 0
          git push
EOF
    
    print_success "GitHub Actions integration configured"
}

# Create documentation
create_documentation() {
    print_status "Creating MCP documentation..."
    
    cat > "$PROJECT_ROOT/QODO_MCP_SETUP.md" << 'EOF'
# Qodo Gen Enterprise MCP Server Setup

## Overview

The Qodo Gen Enterprise MCP Server provides advanced development patterns and automation for the Multi-Hub platform.

## Features

- **Enterprise Component Generation**: TypeScript/React components with security-first patterns
- **GitHub Workflow Automation**: Atomic deployments with rollback mechanisms
- **Iframe Security Optimization**: CSP policies and sandboxing
- **Repository Synchronization**: Cross-platform state management
- **Comprehensive Documentation**: Auto-generated enterprise docs

## Configuration

The MCP server is configured in `.qodo/mcp_config.json` with the following key settings:

- **Project Root**: `g:\GITHUB REPOs\multi-hub-project`
- **Enterprise Mode**: Enabled
- **Security Level**: Strict
- **Atomic Deployments**: Enabled

## Available Tools

1. `generate_enterprise_component` - Create TypeScript/React components
2. `setup_github_workflow` - Generate GitHub Actions workflows
3. `optimize_iframe_security` - Configure iframe security
4. `sync_repository_state` - Synchronize repository state
5. `generate_documentation` - Create comprehensive docs

## Usage

The MCP server integrates with Qodo Gen to provide enterprise-grade development patterns. It automatically applies:

- TypeScript strict mode with decorators
- React enterprise patterns (hooks, context, suspense)
- Security-first iframe integration
- Atomic deployment operations
- Comprehensive error handling and rollback

## Platform Integration

Each platform in the Multi-Hub project has its own configuration in `.qodo/platform-config.json` that enables:

- MCP integration
- Enterprise features
- Deployment automation
- Security optimization

## Troubleshooting

If you encounter issues:

1. Check Node.js version (18+ required)
2. Verify MCP configuration JSON syntax
3. Ensure all dependencies are installed
4. Check environment variables are set correctly

## Support

For issues or questions, refer to the Multi-Hub platform documentation or create an issue in the repository.
EOF
    
    print_success "Documentation created: QODO_MCP_SETUP.md"
}

# Main setup function
main() {
    print_status "Starting Qodo Gen Enterprise MCP Server setup..."
    
    check_nodejs
    install_mcp_dependencies
    validate_mcp_config
    test_mcp_server
    create_platform_configs
    setup_github_actions
    create_documentation
    
    print_success "🎉 Qodo Gen Enterprise MCP Server setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Restart Qodo Gen to load the new MCP configuration"
    echo "2. Test the MCP tools in your development workflow"
    echo "3. Review the documentation in QODO_MCP_SETUP.md"
    echo ""
    echo "MCP Configuration: $MCP_CONFIG_DIR/mcp_config.json"
    echo "Server Location: $SHARED_SERVICES_DIR/qodoGenMcpServer.js"
}

# Run main function
main "$@"