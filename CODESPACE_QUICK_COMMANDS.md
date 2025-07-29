# ⚡ CODESPACE HURTIGE KOMMANDOER

## 🚀 COPY-PASTE KOMMANDOER TIL CODESPACE:

### 📥 **DOWNLOAD OG SETUP:**
```bash
# Download og unzip projekt
curl -L "https://example.com/project.zip" -o project.zip || echo "Upload ZIP manuelt via File Explorer"
unzip project.zip 2>/dev/null || echo "Unzip manuelt eller upload direkte"
find . -name "*.zip" -exec unzip {} \; 2>/dev/null || true
```

### 🔧 **QUICK FILE EDIT:**
```bash
# Ændre alle PLACEHOLDER URLs på én gang
find . -name "upload-path.json" -exec sed -i 's/PLACEHOLDER/https:\/\/github.com\/Alot1z\/REPO_NAME/g' {} \;

# Eller edit manuelt:
code hub-ui/upload-path.json
code ipa-builder/upload-path.json
code printer-builder/upload-path.json
code game-builder/upload-path.json
code ai-models/upload-path.json
```

### 📤 **COMMIT OG PUSH:**
```bash
# Alt i ét kommando
git add . && git commit -m "🚀 Complete Multi-Hub Upload System

✅ Ultra Simple Upload System ready
✅ 5 subprojects configured  
✅ Unlimited repo capability
✅ Perfect for automation

Ready to deploy! 🎯" && git push origin main
```

### 🔍 **DEBUG KOMMANDOER:**
```bash
# Tjek struktur
tree -a -L 2

# Tjek upload-path.json filer
find . -name "upload-path.json" -exec echo "=== {} ===" \; -exec cat {} \; -exec echo "" \;

# Tjek git status
git status

# Tjek workflow fil
cat .github/workflows/upload-to-repos.yml
```

### 🎯 **TEST WORKFLOW LOKALT:**
```bash
# Simuler workflow scanning
find . -name "upload-path.json" -type f | while read config_file; do
    folder=$(dirname "$config_file")
    folder_name=$(basename "$folder")
    url=$(cat "$config_file" | grep -o '"url": *"[^"]*"' | cut -d'"' -f4)
    echo "📁 $folder_name → $url"
done
```

## 📱 **MOBIL OPTIMERET:**
- Alle kommandoer virker på iPad/iPhone
- Copy-paste direkte i Codespace terminal
- File editor indbygget i browser
- Git push med ét klik

## 🔑 **HUSK:**
1. **Upload ZIP** via File Explorer hvis curl fejler
2. **Edit URLs** i alle `upload-path.json` filer
3. **Setup UPLOAD_PATH** secret i GitHub
4. **Run workflow** fra Actions tab

**PERFEKT TIL HURTIG DEPLOYMENT! ⚡**