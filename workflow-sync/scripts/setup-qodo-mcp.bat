@echo off
REM Setup script for Qodo Gen Enterprise MCP Server
REM Multi-Hub Platform Development Environment

setlocal enabledelayedexpansion

echo 🚀 Setting up Qodo Gen Enterprise MCP Server...

set PROJECT_ROOT=g:\GITHUB REPOs\multi-hub-project
set MCP_CONFIG_DIR=%PROJECT_ROOT%\.qodo
set SHARED_SERVICES_DIR=%PROJECT_ROOT%\shared\services

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js %NODE_VERSION% is installed

REM Install MCP SDK dependencies
echo [INFO] Installing MCP SDK dependencies...
cd /d "%SHARED_SERVICES_DIR%"

if not exist "package.json" (
    echo [ERROR] package.json not found in %SHARED_SERVICES_DIR%
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [SUCCESS] MCP dependencies installed

REM Validate MCP configuration
echo [INFO] Validating MCP configuration...
if not exist "%MCP_CONFIG_DIR%\mcp_config.json" (
    echo [ERROR] MCP configuration file not found: %MCP_CONFIG_DIR%\mcp_config.json
    exit /b 1
)

REM Test JSON syntax using Node.js
node -e "try { JSON.parse(require('fs').readFileSync('%MCP_CONFIG_DIR%\\mcp_config.json', 'utf8')); console.log('Valid JSON'); } catch(e) { console.error('Invalid JSON:', e.message); process.exit(1); }"
if errorlevel 1 (
    echo [ERROR] Invalid JSON in MCP configuration file
    exit /b 1
)
echo [SUCCESS] MCP configuration is valid

REM Set environment variables for testing
set MULTI_HUB_PROJECT_ROOT=%PROJECT_ROOT%
set QODO_GEN_MODE=enterprise
set ENABLE_TYPESCRIPT_PATTERNS=true
set ENABLE_REACT_ENTERPRISE=true
set ENABLE_GITHUB_ACTIONS=true
set ENABLE_NETLIFY_OPTIMIZATION=true
set ENABLE_SECURITY_FIRST=true
set ENABLE_ATOMIC_DEPLOYMENTS=true

echo [INFO] Testing MCP server...
REM Start server in background and test
start /b node qodoGenMcpServer.js
timeout /t 3 >nul
tasklist /fi "imagename eq node.exe" | find "node.exe" >nul
if errorlevel 1 (
    echo [ERROR] MCP server failed to start
    exit /b 1
)
echo [SUCCESS] MCP server started successfully

REM Kill the test server
taskkill /f /im node.exe >nul 2>&1

REM Create platform-specific configurations
echo [INFO] Creating platform-specific configurations...
set PLATFORMS=ai-models bolt-new qodo-gen hub-ui game-builder printer-builder ipa-builder api

for %%p in (%PLATFORMS%) do (
    if exist "%PROJECT_ROOT%\%%p" (
        if not exist "%PROJECT_ROOT%\%%p\.qodo" mkdir "%PROJECT_ROOT%\%%p\.qodo"
        
        echo {> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo   "platform": "%%p",>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo   "mcpIntegration": {>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo     "enabled": true,>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo     "serverUrl": "stdio://shared/services/qodoGenMcpServer.js",>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo     "enterpriseMode": true>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo   },>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo   "features": {>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo     "typescript": true,>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo     "react": true,>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo     "security": true,>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo     "automation": true>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo   },>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo   "deployment": {>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo     "netlify": true,>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo     "githubPages": true,>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo     "atomic": true,>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo     "rollback": true>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo   }>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        echo }>> "%PROJECT_ROOT%\%%p\.qodo\platform-config.json"
        
        echo [SUCCESS] Created configuration for %%p
    ) else (
        echo [WARNING] Platform directory not found: %%p
    )
)

echo [SUCCESS] 🎉 Qodo Gen Enterprise MCP Server setup completed!
echo.
echo Next steps:
echo 1. Restart Qodo Gen to load the new MCP configuration
echo 2. Test the MCP tools in your development workflow
echo 3. Review the documentation in QODO_MCP_SETUP.md
echo.
echo MCP Configuration: %MCP_CONFIG_DIR%\mcp_config.json
echo Server Location: %SHARED_SERVICES_DIR%\qodoGenMcpServer.js

pause