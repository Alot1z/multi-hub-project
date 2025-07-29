# 🔑 NETLIFY TOKEN SETUP - STEP BY STEP

## 🎯 **ÉN TOKEN TIL ALT!**

### 1️⃣ **OPRET NETLIFY AUTH TOKEN:**
1. Gå til [Netlify Personal Access Tokens](https://app.netlify.com/user/applications#personal-access-tokens)
2. Klik **"New access token"**
3. **Description:** `GitHub Actions Deploy`
4. Klik **"Generate token"**
5. **KOPIER TOKEN** (du ser den kun én gang!)

### 2️⃣ **TILFØJ TOKEN TIL MAIN GITHUB REPO:**
Gå til din **multi-hub-project** repo:
1. **Settings** → **Secrets and variables** → **Actions**
2. Klik **"New repository secret"**
3. **Name:** `NETLIFY_AUTH_TOKEN`
4. **Secret:** indsæt din token
5. Klik **"Add secret"**

### 3️⃣ **FIND SITE IDs FOR HVER NETLIFY PROJEKT:**

**For hub-uii projekt:**
1. Gå til Netlify dashboard → klik på **hub-uii**
2. **Site settings** → **General**
3. Kopier **Site ID** (fx: `abc123-def456-ghi789`)
4. Tilføj som GitHub secret:
   - **Name:** `NETLIFY_SITE_ID_HUB_UI`
   - **Secret:** din Site ID

**For ipa-builder projekt:**
1. Klik på **ipa-builder** i Netlify
2. Kopier Site ID
3. GitHub secret: `NETLIFY_SITE_ID_IPA_BUILDER`

**For printer-builder projekt:**
1. Klik på **printer-builder** i Netlify
2. Kopier Site ID  
3. GitHub secret: `NETLIFY_SITE_ID_PRINTER_BUILDER`

**For game-build projekt:**
1. Klik på **game-build** i Netlify
2. Kopier Site ID
3. GitHub secret: `NETLIFY_SITE_ID_GAME_BUILDER`

**For ai-modelss projekt:**
1. Klik på **ai-modelss** i Netlify
2. Kopier Site ID
3. GitHub secret: `NETLIFY_SITE_ID_AI_MODELS`

## 📋 **ALLE SECRETS I MAIN REPO:**
```
NETLIFY_AUTH_TOKEN = din_netlify_token
NETLIFY_SITE_ID_HUB_UI = site_id_fra_hub_uii
NETLIFY_SITE_ID_IPA_BUILDER = site_id_fra_ipa_builder
NETLIFY_SITE_ID_PRINTER_BUILDER = site_id_fra_printer_builder
NETLIFY_SITE_ID_GAME_BUILDER = site_id_fra_game_build
NETLIFY_SITE_ID_AI_MODELS = site_id_fra_ai_modelss
```

## 🚀 **EFTER SETUP:**
1. Kør upload workflow (uploader kode)
2. Kør Netlify deploy workflow (deployer til Netlify)
3. Alle projekter er live!

## ❌ **IKKE TILFØJ TOKENS TIL NETLIFY ENVIRONMENT VARIABLES!**
- Tokens tilføjes kun til GitHub repo secrets
- Netlify environment variables er til andre ting
- GitHub Actions bruger secrets til at deploye

**ÉN TOKEN + 5 SITE IDs = AUTOMATISK DEPLOYMENT! 🎉**