# 🚀 BOLT.NEW → GITHUB WORKFLOW

## ✅ **JA! Alt kan klares fra Bolt.new - ingen Codespace nødvendig!**

### 📥 **STEP 1: DOWNLOAD FRA BOLT**
1. Klik **"Download"** knappen øverst i Bolt
2. Du får en ZIP med ALLE filer inkluderet
3. Unzip på din computer

### 📤 **STEP 2: UPLOAD TIL GITHUB**
1. Gå til `github.com/Alot1z/multi-hub-project` (eller dit repo navn)
2. Klik **"uploading an existing file"** 
3. Drag & drop hele mappen eller vælg alle filer
4. Skriv commit besked: `🚀 Complete Multi-Hub System Upload`
5. Klik **"Commit changes"**

### 🔧 **STEP 3: ÆNDRE PLACEHOLDER URLs**
Gå ind i hver `upload-path.json` fil og ændre:

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

### 🔑 **STEP 4: SETUP TOKEN**
1. GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Name: `UPLOAD_PATH`
4. Select: **repo** (full control)
5. Generate token og kopier den
6. Gå til din repo → Settings → Secrets → Actions
7. New repository secret: Name: `UPLOAD_PATH`, Value: din token

### 🚀 **STEP 5: RUN WORKFLOW**
1. Gå til **Actions** tab i din repo
2. Vælg **"🚀 Ultra Simple Upload System"**
3. Klik **"Run workflow"**
4. Input: `all`
5. Klik **"Run workflow"**

## 🎉 **FÆRDIG!**
Nu uploader systemet automatisk alle 5 subprojects til deres egne repos!

**BOLT.NEW KLARER ALT - INGEN CODESPACE NØDVENDIG! ✅**