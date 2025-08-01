#!/bin/bash

# 🎯 Multi-Hub Collaborator Setup Script
# This script sets up a safe collaboration environment for friends

echo "🚀 Setting up Multi-Hub collaboration environment..."
echo "👥 This will configure readonly access for safe collaboration"

# Create scripts directory if it doesn't exist
mkdir -p scripts

# 1. Copy readonly MCP config for collaborators
echo "📝 Setting up readonly Git-MCP configuration..."
if [ -f ".windsurf/mcp_servers_readonly.json" ]; then
    cp .windsurf/mcp_servers_readonly.json .windsurf/mcp_servers.json
    echo "✅ Readonly MCP configuration applied"
else
    echo "❌ Readonly MCP config not found. Creating basic version..."
    cat > .windsurf/mcp_servers.json << 'EOF'
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
EOF
fi

# 2. Setup development environment
echo "🔧 Setting up development environment..."
cat > .env.local << EOF
# Development Environment for Collaborators
ENVIRONMENT=development
NETLIFY_SITE_PREFIX=dev-$(whoami)
GITHUB_MODE=readonly
NODE_ENV=development

# Note: Production tokens are not included for security
# Collaborators should use their own Netlify accounts for testing
EOF

# 3. Create development platform.txt
echo "🌐 Creating development platform configuration..."
cat > platform-dev.txt << 'EOF'
# Development Platform Configuration
# Collaborators should update these URLs with their own Netlify deployments
https://Alot1z.github.io
https://github.com/Alot1z/multi-hub-project
https://dev-collaborator-hub-ui.netlify.app
https://dev-collaborator-ipa-builder.netlify.app
https://dev-collaborator-printer-builder.netlify.app
https://dev-collaborator-game-builder.netlify.app
https://dev-collaborator-ai-models.netlify.app
EOF

# 4. Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

# 5. Setup git hooks for security
echo "🛡️ Setting up security git hooks..."
mkdir -p .git/hooks

cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Security pre-commit hook for Multi-Hub collaborators

echo "🔍 Running security checks..."

# Check for hardcoded tokens
if grep -r "ghp_\|nfp_\|sk-\|GITHUB_TOKEN\|NETLIFY_TOKEN" --exclude-dir=.git --exclude-dir=node_modules --exclude="*.md" .; then
    echo "❌ FEJL: Hardcoded tokens or secrets found!"
    echo "🛡️ Remove all tokens before committing"
    exit 1
fi

# Check for admin-only files
if git diff --cached --name-only | grep -E "(mcp_config\.json|\.env\.production|secrets)"; then
    echo "❌ FEJL: Admin-only files detected!"
    echo "🛡️ These files should not be modified by collaborators"
    exit 1
fi

# Check for proper branch naming
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ ! $BRANCH =~ ^(feature/|bugfix/|experimental/) ]] && [[ $BRANCH != "main" ]]; then
    echo "⚠️  WARNING: Branch should start with feature/, bugfix/, or experimental/"
    echo "📝 Current branch: $BRANCH"
fi

echo "✅ Security checks passed"
EOF

chmod +x .git/hooks/pre-commit

# 6. Create collaborator documentation
echo "📚 Creating collaborator documentation..."
cat > COLLABORATOR_GUIDE.md << 'EOF'
# 👥 Multi-Hub Collaborator Guide

## 🎯 Welcome Collaborator!

This guide will help you safely contribute to the Multi-Hub project.

## 🛡️ Security First

- **Never commit tokens or secrets**
- **Use feature branches only**
- **Test on your own Netlify account**
- **Submit pull requests for review**

## 🚀 Getting Started

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally
3. **Run setup script**: `./scripts/setup-collaborator.sh`
4. **Create feature branch**: `git checkout -b feature/your-awesome-feature`

## 🔧 Development Workflow

### Adding a New Builder

1. **Create builder directory**: `my-awesome-builder/`
2. **Copy template**: Use existing builders as reference
3. **Update platform-dev.txt**: Add your Netlify URL
4. **Test locally**: `npm run dev`
5. **Deploy to your Netlify**: Test live version
6. **Submit pull request**: For review and merge

### Testing Your Changes

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to your Netlify account
netlify deploy --prod
```

## 📝 Contribution Guidelines

- **Follow existing code style**
- **Add documentation** for new features
- **Test thoroughly** before submitting PR
- **Use descriptive commit messages**
- **Keep PRs focused** on single features

## 🆘 Getting Help

- **Read documentation** in `/docs` folder
- **Check existing issues** on GitHub
- **Ask questions** in pull request comments
- **Follow security guidelines** always

## ✅ Checklist Before PR

- [ ] Code follows project style
- [ ] No hardcoded tokens or secrets
- [ ] Tested on personal Netlify deployment
- [ ] Documentation updated if needed
- [ ] Security checks pass
- [ ] Feature branch used (not main)

Happy coding! 🎉
EOF

# 7. Final setup verification
echo "🔍 Verifying setup..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  Git not initialized. Run: git init"
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No git remote set. Add your fork as origin:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/multi-hub-project"
fi

echo ""
echo "🎉 Collaborator environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. 🍴 Fork the repository on GitHub if you haven't already"
echo "2. 🔗 Set your fork as origin remote"
echo "3. 🌿 Create a feature branch: git checkout -b feature/your-feature"
echo "4. 🚀 Start building awesome features!"
echo "5. 📖 Read COLLABORATOR_GUIDE.md for detailed instructions"
echo ""
echo "🛡️ Security reminders:"
echo "- Never commit tokens or secrets"
echo "- Use your own Netlify account for testing"
echo "- Submit pull requests for all changes"
echo "- Follow the security guidelines"
echo ""
echo "Happy collaborating! 🎯"
