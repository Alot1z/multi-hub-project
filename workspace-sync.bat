@echo off
REM Multi-Hub Workspace Sync Script
REM Syncs all workflows and configs to local workspace

echo 🔄 Multi-Hub Workspace Sync Starting...

set PROJECT_ROOT=g:\GITHUB REPOs\multi-hub-project
set WORKSPACE_DIR=%PROJECT_ROOT%\workspace-sync

REM Create workspace structure
echo 📁 Creating workspace structure...
if not exist "%WORKSPACE_DIR%" mkdir "%WORKSPACE_DIR%"
if not exist "%WORKSPACE_DIR%\github-actions" mkdir "%WORKSPACE_DIR%\github-actions"
if not exist "%WORKSPACE_DIR%\mcp-configs" mkdir "%WORKSPACE_DIR%\mcp-configs"
if not exist "%WORKSPACE_DIR%\scripts" mkdir "%WORKSPACE_DIR%\scripts"
if not exist "%WORKSPACE_DIR%\docs" mkdir "%WORKSPACE_DIR%\docs"

REM Sync GitHub Actions workflows
echo 🔄 Syncing GitHub Actions workflows...
xcopy "%PROJECT_ROOT%\.github\workflows\*" "%WORKSPACE_DIR%\github-actions\" /Y /Q

REM Sync MCP configurations
echo ⚙️ Syncing MCP configurations...
if exist "%PROJECT_ROOT%\.qodo\mcp_config.json" (
    copy "%PROJECT_ROOT%\.qodo\mcp_config.json" "%WORKSPACE_DIR%\mcp-configs\project-mcp-config.json" /Y
)

if exist "%PROJECT_ROOT%\shared\services" (
    xcopy "%PROJECT_ROOT%\shared\services\*" "%WORKSPACE_DIR%\mcp-configs\services\" /Y /S /Q
)

REM Sync scripts
echo 📜 Syncing scripts...
if exist "%PROJECT_ROOT%\scripts" (
    xcopy "%PROJECT_ROOT%\scripts\*" "%WORKSPACE_DIR%\scripts\" /Y /Q
)

REM Create index files
echo 📋 Creating index files...

REM GitHub Actions index
echo # GitHub Actions Workflows Index > "%WORKSPACE_DIR%\github-actions\README.md"
echo Generated: %date% %time% >> "%WORKSPACE_DIR%\github-actions\README.md"
echo. >> "%WORKSPACE_DIR%\github-actions\README.md"
for %%f in ("%WORKSPACE_DIR%\github-actions\*.yml") do (
    echo - [%%~nxf](./%%~nxf) >> "%WORKSPACE_DIR%\github-actions\README.md"
)

REM MCP configs index
echo # MCP Configurations Index > "%WORKSPACE_DIR%\mcp-configs\README.md"
echo Generated: %date% %time% >> "%WORKSPACE_DIR%\mcp-configs\README.md"
echo. >> "%WORKSPACE_DIR%\mcp-configs\README.md"
echo - [Project MCP Config](./project-mcp-config.json) >> "%WORKSPACE_DIR%\mcp-configs\README.md"
echo - [Shared Services](./services/) >> "%WORKSPACE_DIR%\mcp-configs\README.md"

REM Scripts index
echo # Scripts Index > "%WORKSPACE_DIR%\scripts\README.md"
echo Generated: %date% %time% >> "%WORKSPACE_DIR%\scripts\README.md"
echo. >> "%WORKSPACE_DIR%\scripts\README.md"
for %%f in ("%WORKSPACE_DIR%\scripts\*") do (
    echo - [%%~nxf](./%%~nxf) >> "%WORKSPACE_DIR%\scripts\README.md"
)

REM Main workspace README
echo # Multi-Hub Local Workspace > "%WORKSPACE_DIR%\README.md"
echo. >> "%WORKSPACE_DIR%\README.md"
echo This directory contains local copies of all GitHub Actions workflows, MCP configurations, and scripts. >> "%WORKSPACE_DIR%\README.md"
echo. >> "%WORKSPACE_DIR%\README.md"
echo ## Structure >> "%WORKSPACE_DIR%\README.md"
echo. >> "%WORKSPACE_DIR%\README.md"
echo - github-actions/ - All GitHub Actions workflow files >> "%WORKSPACE_DIR%\README.md"
echo - mcp-configs/ - MCP server configurations and services >> "%WORKSPACE_DIR%\README.md"
echo - scripts/ - Automation and setup scripts >> "%WORKSPACE_DIR%\README.md"
echo - docs/ - Generated documentation >> "%WORKSPACE_DIR%\README.md"
echo. >> "%WORKSPACE_DIR%\README.md"
echo ## Usage with GitHub Desktop >> "%WORKSPACE_DIR%\README.md"
echo. >> "%WORKSPACE_DIR%\README.md"
echo 1. Open GitHub Desktop >> "%WORKSPACE_DIR%\README.md"
echo 2. Navigate to this workspace-sync directory >> "%WORKSPACE_DIR%\README.md"
echo 3. All files are ready for editing and syncing >> "%WORKSPACE_DIR%\README.md"
echo. >> "%WORKSPACE_DIR%\README.md"
echo Last Updated: %date% %time% >> "%WORKSPACE_DIR%\README.md"

echo ✅ Workspace sync completed!
echo 📁 Location: %WORKSPACE_DIR%
echo 🔗 Ready for GitHub Desktop integration

pause
