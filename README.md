# 🧪 TrollStore Factory (GitHub + Netlify)

Dette er et komplet **Multi-Hub Platform** system med AI-drevet DevOps til iOS, 3D Printing, Games & More.

## 🚀 Komplet System Overview

### 📱 **PRIVATE REPOS (Kildekode):**
- **multi-hub-project** (denne repo) - Main private repo med alt kildekode
- **hub-ui** - https://github.com/Alot1z/hub-ui
- **ipa-builder** - https://github.com/Alot1z/ipa-builder  
- **printer-builder** - https://github.com/Alot1z/printer-builder
- **game-builder** - https://github.com/Alot1z/game-builder
- **ai-models** - https://github.com/Alot1z/ai-models

### 🌐 **PUBLIC REPO (Launcher):**
- **Alot1z.github.io** - https://github.com/Alot1z/Alot1z.github.io (GitHub Pages - IKKE Netlify)

### 🚀 **NETLIFY DEPLOYMENTS:**
- **Hub-UI** - https://alot1z-hub-ui.netlify.app (Main Platform)
- **IPA Builder** - https://alot1z-ipa-builder.netlify.app (iOS Apps)
- **Printer Builder** - https://alot1z-printer-builder.netlify.app (3D Models)
- **Game Builder** - https://alot1z-game-builder.netlify.app (Games)
- **AI Models** - https://alot1z-ai-models.netlify.app (AI Management)

### 🎯 **HOSTING OVERSIGT:**
- **Public launcher:** GitHub Pages (gratis)
- **Private apps:** Netlify (gratis tier)
- **Total:** 1 GitHub Pages + 5 Netlify sites

## 🔒 Sikkerhedssystem

### **2-Lags Sikkerhed:**
1. **Public repo** (`Alot1z.github.io`) indeholder kun launcher
2. **Private repo** (`multi-hub-project`) indeholder alle rigtige URLs
3. **Dobbelt base URL check** forhindrer uautoriseret adgang
4. **Kun Alot1z.github.io** kan aktivere systemet

## 🛠️ Upload System

### **Ultra Simple Upload:**
- Hver mappe har `upload-path.txt` med target repo URL (inklusiv alo1z-github-io/)
- GitHub Actions workflow uploader automatisk til alle repos
- Ét klik = alle repos opdateret

### **Auto Netlify Deployment:**
- GitHub Actions deployer automatisk til Netlify
- Kræver Netlify auth token og site IDs som secrets
- Se `NETLIFY_DEPLOYMENT_GUIDE.md` for setup

### **Kør Upload:**
1. Gå til **Actions** tab
2. Vælg **"🚀 Ultra Simple Upload System"**
3. Klik **"Run workflow"**
4. Skriv `all`
5. Klik **"Run workflow"**

### **Kør Netlify Deploy:**
1. Setup Netlify secrets (se guide)
2. Gå til **Actions** tab
3. Vælg **"🚀 Auto Deploy All Projects to Netlify"**
4. Klik **"Run workflow"**
5. Skriv `all`

### **Inkluderede Upload Mapper:**
- `alo1z-github-io/` → `https://github.com/Alot1z/Alot1z.github.io` (Public launcher)
- `hub-ui/` → `https://github.com/Alot1z/hub-ui` (Main platform)
- `ipa-builder/` → `https://github.com/Alot1z/ipa-builder` (iOS builder)
- `printer-builder/` → `https://github.com/Alot1z/printer-builder` (3D builder)
- `game-builder/` → `https://github.com/Alot1z/game-builder` (Game builder)
- `ai-models/` → `https://github.com/Alot1z/ai-models` (AI management)

## 🔑 Token Setup

Se `NETLIFY_TOKEN_SETUP.md` for detaljeret guide til:
- Oprettelse af Netlify auth token
- Tilføjelse af GitHub secrets
- Site ID setup for alle projekter

## 📁 Mappestruktur

```
multi-hub-project/
├── platform.txt                    # Alle Netlify URLs (sikker)
├── alo1z-github-io/                # Public repo filer (Alot1z.github.io)
│   ├── index.html                  # Launcher med sikkerhed
│   ├── platform.txt                # Kun base URL + private repo
│   ├── upload-path.txt             # Upload target URL
│   └── README.md                   # Public info
├── hub-ui/                         # Main platform router
├── ipa-builder/                    # iOS app builder
├── printer-builder/                # 3D model generator  
├── game-builder/                   # Game development
├── ai-models/                      # AI management
└── .github/workflows/              # Auto upload system
```
