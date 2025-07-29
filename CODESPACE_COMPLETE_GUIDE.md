# 🚀 CODESPACE KOMPLET GUIDE - UPLOAD HELE PROJEKTET

## 📱 PERFEKT TIL MOBIL/iPad - INGEN TERMINAL NØDVENDIG!

### 1️⃣ **ÅBEN CODESPACE:**
1. Gå til din GitHub repo (fx `github.com/Alot1z/multi-hub-project`)
2. Klik **"Code"** → **"Codespaces"** → **"Create codespace on main"**
3. Vent 30 sekunder - nu har du fuld Linux computer i browseren!

### 2️⃣ **DOWNLOAD BOLT PROJECT:**
I Codespace terminal, kør:
```bash
# Download nyeste ZIP fra Bolt
curl -L "https://bolt.new/download/project.zip" -o project.zip

# Eller upload manuelt via File Explorer
# Klik på "Explorer" → højreklik → "Upload" → vælg din ZIP
```

### 3️⃣ **UNZIP OG SETUP:**
```bash
# Unzip projektet
unzip project.zip

# Flyt alle filer til root
mv project-files/* .
mv project-files/.[^.]* . 2>/dev/null || true
rmdir project-files

# Tjek at alt er der
ls -la
```

### 4️⃣ **ÆNDRE PLACEHOLDER URLs:**
Åben hver `upload-path.json` fil og ændre:

**hub-ui/upload-path.json:**
```json
{
  "url": "https://github.com/Alot1z/hub-ui"
}
```

**ipa-builder/upload-path.json:**
```json
{
  "url": "https://github.com/Alot1z/ipa-builder"
}
```

**printer-builder/upload-path.json:**
```json
{
  "url": "https://github.com/Alot1z/printer-builder"
}
```

**game-builder/upload-path.json:**
```json
{
  "url": "https://github.com/Alot1z/game-builder"
}
```

**ai-models/upload-path.json:**
```json
{
  "url": "https://github.com/Alot1z/ai-models"
}
```

### 5️⃣ **COMMIT OG PUSH:**
```bash
# Tilføj alle filer
git add .

# Commit med besked
git commit -m "🚀 Complete Multi-Hub Project Upload

✅ Ultra Simple Upload System
✅ 5 subprojects ready for deployment
✅ Unlimited repo upload capability
✅ Perfect for vacation automation

🎯 Ready to deploy to Netlify!"

# Push til GitHub
git push origin main
```

### 6️⃣ **SETUP GITHUB TOKEN:**
1. Gå til **GitHub Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Klik **"Generate new token (classic)"**
3. Navn: `UPLOAD_PATH`
4. Vælg **repo** (fuld adgang til repositories)
5. Klik **"Generate token"**
6. **KOPIER TOKEN** (du ser den kun én gang!)

### 7️⃣ **TILFØJ TOKEN SOM SECRET:**
1. Gå til din repo → **Settings** → **Secrets and variables** → **Actions**
2. Klik **"New repository secret"**
3. Name: `UPLOAD_PATH`
4. Secret: **indsæt din token**
5. Klik **"Add secret"**

### 8️⃣ **TEST UPLOAD SYSTEM:**
1. Gå til **Actions** tab i din repo
2. Vælg **"🚀 Ultra Simple Upload System"**
3. Klik **"Run workflow"**
4. Skriv `all` i input feltet
5. Klik **"Run workflow"**

## 🎉 **FÆRDIG!**

Nu uploader systemet automatisk:
- ✅ `hub-ui/` → `github.com/Alot1z/hub-ui`
- ✅ `ipa-builder/` → `github.com/Alot1z/ipa-builder`
- ✅ `printer-builder/` → `github.com/Alot1z/printer-builder`
- ✅ `game-builder/` → `github.com/Alot1z/game-builder`
- ✅ `ai-models/` → `github.com/Alot1z/ai-models`

## 📱 **MOBIL TIPS:**
- **Codespace virker perfekt på iPad/iPhone**
- **File upload** via browser interface
- **Terminal kommandoer** kan kopieres direkte
- **Git push** virker med ét klik

## 🔧 **TROUBLESHOOTING:**

### Problem: "Permission denied"
```bash
# Fix permissions
chmod +x .github/workflows/upload-to-repos.yml
```

### Problem: "Token invalid"
- Tjek at din `UPLOAD_PATH` secret er korrekt sat
- Token skal have **repo** permissions

### Problem: "Repo not found"
- Tjek at alle URLs i `upload-path.json` er korrekte
- Repos skal eksistere på GitHub først

## 🚀 **NÆSTE SKRIDT:**
Efter upload, deploy hver repo til Netlify:
1. Gå til netlify.com
2. "New site from Git"
3. Vælg dit GitHub repo
4. Deploy (auto-detecter `netlify.toml`)
5. Kopier Netlify URL til `.platform.json`

**PERFEKT SYSTEM TIL FERIE! 🏖️**