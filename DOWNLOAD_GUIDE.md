# 📥 Download Guide - Alle Repository Filer

## 🚀 HURTIGSTE METODE (1 klik per repo)

### 1. Download fra dette Bolt projekt:
- Klik **"Download"** knappen øverst i Bolt
- Unzip filen på din computer
- Du får alle mapper: `hub-ui/`, `ipa-builder/`, `printer-builder/`, osv.

### 2. Upload til dine GitHub repos:

**For hver mappe:**
1. Gå til dit GitHub repo (fx `Alot1z/hub-ui`)
2. Klik **"uploading an existing file"** 
3. Drag & drop hele mappen
4. Commit changes

## 📁 REPO MAPPING:

```
Downloaded folder → Upload to GitHub repo
─────────────────────────────────────────
hub-ui/          → Alot1z/hub-ui
ipa-builder/     → Alot1z/ipa-builder  
printer-builder/ → Alot1z/printer-builder
game-builder/    → Alot1z/game-builder
ai-models/       → Alot1z/ai-models
```

## 🌐 NETLIFY DEPLOYMENT:

Efter upload til GitHub:
1. Gå til netlify.com
2. "New site from Git"
3. Vælg dit GitHub repo
4. Deploy (auto-detecter netlify.toml)
5. Kopier den random URL (fx `amazing-unicorn-123.netlify.app`)

## 📝 OPDATER PLATFORM CONFIG:

I din `Alot1z/github.io` repo, opdater `.platform.json`:

```json
{
  "base_url": "https://mose.windsurf.build",
  "subprojects": {
    "hub-ui": "https://DIN-HUB-URL.netlify.app",
    "ipa-builder": "https://DIN-IPA-URL.netlify.app",
    "printer-builder": "https://DIN-3D-URL.netlify.app",
    "game-builder": "https://DIN-GAME-URL.netlify.app",
    "ai-models": "https://DIN-AI-URL.netlify.app"
  }
}
```

## ✅ FÆRDIG!

Nu virker hele dit system via `mose.windsurf.build` eller `alo1z.github.io`