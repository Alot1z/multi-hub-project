# Multi-Hub Workspace Sync Script (PowerShell)
# Syncs all workflows and configs to local workspace

Write-Host "🔄 Multi-Hub Workspace Sync Starting..." -ForegroundColor Cyan

$PROJECT_ROOT = "g:\GITHUB REPOs\multi-hub-project"
$WORKSPACE_DIR = "$PROJECT_ROOT\workspace-sync"

# Create workspace structure
Write-Host "📁 Creating workspace structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "$WORKSPACE_DIR" -Force | Out-Null
New-Item -ItemType Directory -Path "$WORKSPACE_DIR\github-actions" -Force | Out-Null
New-Item -ItemType Directory -Path "$WORKSPACE_DIR\mcp-configs" -Force | Out-Null
New-Item -ItemType Directory -Path "$WORKSPACE_DIR\scripts" -Force | Out-Null
New-Item -ItemType Directory -Path "$WORKSPACE_DIR\docs" -Force | Out-Null

# Sync GitHub Actions workflows
Write-Host "🔄 Syncing GitHub Actions workflows..." -ForegroundColor Yellow
if (Test-Path "$PROJECT_ROOT\.github\workflows") {
    Copy-Item "$PROJECT_ROOT\.github\workflows\*" "$WORKSPACE_DIR\github-actions\" -Force -Recurse
}

# Sync MCP configurations
Write-Host "⚙️ Syncing MCP configurations..." -ForegroundColor Yellow
if (Test-Path "$PROJECT_ROOT\.qodo\mcp_config.json") {
    Copy-Item "$PROJECT_ROOT\.qodo\mcp_config.json" "$WORKSPACE_DIR\mcp-configs\project-mcp-config.json" -Force
}

if (Test-Path "$PROJECT_ROOT\shared\services") {
    New-Item -ItemType Directory -Path "$WORKSPACE_DIR\mcp-configs\services" -Force | Out-Null
    Copy-Item "$PROJECT_ROOT\shared\services\*" "$WORKSPACE_DIR\mcp-configs\services\" -Force -Recurse
}

# Sync scripts
Write-Host "📜 Syncing scripts..." -ForegroundColor Yellow
if (Test-Path "$PROJECT_ROOT\scripts") {
    Copy-Item "$PROJECT_ROOT\scripts\*" "$WORKSPACE_DIR\scripts\" -Force -Recurse
}

# Sync workflow logs
Write-Host "📊 Syncing workflow logs..." -ForegroundColor Yellow
if (Test-Path "$PROJECT_ROOT\workflow-logs") {
    New-Item -ItemType Directory -Path "$WORKSPACE_DIR\workflow-logs" -Force | Out-Null
    Copy-Item "$PROJECT_ROOT\workflow-logs\*" "$WORKSPACE_DIR\workflow-logs\" -Force -Recurse
}

# Create index files
Write-Host "📋 Creating index files..." -ForegroundColor Yellow

# GitHub Actions index
$githubActionsReadme = @"
# GitHub Actions Workflows Index

Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')

"@

$workflowFiles = Get-ChildItem "$WORKSPACE_DIR\github-actions\*.yml" -ErrorAction SilentlyContinue
foreach ($file in $workflowFiles) {
    $githubActionsReadme += "- [$($file.Name)](./$($file.Name))`n"
}

$githubActionsReadme | Out-File "$WORKSPACE_DIR\github-actions\README.md" -Encoding UTF8

# MCP configs index
$mcpConfigsReadme = @"
# MCP Configurations Index

Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')

- [Project MCP Config](./project-mcp-config.json)
- [Shared Services](./services/)
"@

$mcpConfigsReadme | Out-File "$WORKSPACE_DIR\mcp-configs\README.md" -Encoding UTF8

# Scripts index
$scriptsReadme = @"
# Scripts Index

Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')

"@

$scriptFiles = Get-ChildItem "$WORKSPACE_DIR\scripts\*" -ErrorAction SilentlyContinue
foreach ($file in $scriptFiles) {
    $scriptsReadme += "- [$($file.Name)](./$($file.Name))`n"
}

$scriptsReadme | Out-File "$WORKSPACE_DIR\scripts\README.md" -Encoding UTF8

# Main workspace README
$mainReadme = @"
# Multi-Hub Local Workspace

This directory contains local copies of all GitHub Actions workflows, MCP configurations, and scripts.

## Structure

- **github-actions/** - All GitHub Actions workflow files
- **mcp-configs/** - MCP server configurations and services
- **scripts/** - Automation and setup scripts
- **docs/** - Generated documentation

## Usage with GitHub Desktop

1. Open GitHub Desktop
2. Navigate to this workspace-sync directory
3. All files are ready for editing and syncing
4. Changes will be automatically detected by GitHub Desktop

## Automatic Sync

- GitHub Actions workflow syncs every 6 hours
- Manual sync available via workflow dispatch
- Local sync via this PowerShell script

## Files Synced

- **Workflows:** $(($workflowFiles | Measure-Object).Count) files
- **MCP Configs:** Available in mcp-configs/
- **Scripts:** $(($scriptFiles | Measure-Object).Count) files

Last Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')
"@

$mainReadme | Out-File "$WORKSPACE_DIR\README.md" -Encoding UTF8

# Create deployment info JSON
$deploymentInfo = @{
    syncedAt = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
    syncType = "local-powershell"
    workspaceLocation = $WORKSPACE_DIR
    projectRoot = $PROJECT_ROOT
} | ConvertTo-Json -Depth 3

$deploymentInfo | Out-File "$WORKSPACE_DIR\deployment-info.json" -Encoding UTF8

Write-Host "✅ Workspace sync completed!" -ForegroundColor Green
Write-Host "📁 Location: $WORKSPACE_DIR" -ForegroundColor Cyan
Write-Host "🔗 Ready for GitHub Desktop integration" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Sync Summary:" -ForegroundColor Yellow
Write-Host "  🔄 GitHub Actions: $(($workflowFiles | Measure-Object).Count) files"
Write-Host "  ⚙️ MCP Configs: Synced"
Write-Host "  📜 Scripts: $(($scriptFiles | Measure-Object).Count) files"
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Magenta
Write-Host "  1. Open GitHub Desktop"
Write-Host "  2. Navigate to workspace-sync/ directory"
Write-Host "  3. All files are ready for local editing"

Read-Host "Press Enter to continue"
