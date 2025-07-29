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
- **Alot1z.github.io** - https://github.com/Alot1z/Alot1z.github.io

### 🚀 **NETLIFY DEPLOYMENTS:**
- **Hub-UI** - https://hub-uii.netlify.app (Main Platform)
- **IPA Builder** - https://ipa-builder.netlify.app (iOS Apps)
- **Printer Builder** - https://printer-builder.netlify.app (3D Models)
- **Game Builder** - https://game-build.netlify.app (Games)
- **AI Models** - https://ai-modelss.netlify.app (AI Management)

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

### **Kør Upload:**
1. Gå til **Actions** tab
2. Vælg **"🚀 Ultra Simple Upload System"**
3. Klik **"Run workflow"**
4. Skriv `all`
5. Klik **"Run workflow"**

### **Inkluderede Upload Mapper:**
- `alo1z-github-io/` → `https://github.com/Alot1z/Alot1z.github.io` (Public launcher)
- `hub-ui/` → `https://github.com/Alot1z/hub-ui` (Main platform)
- `ipa-builder/` → `https://github.com/Alot1z/ipa-builder` (iOS builder)
- `printer-builder/` → `https://github.com/Alot1z/printer-builder` (3D builder)
- `game-builder/` → `https://github.com/Alot1z/game-builder` (Game builder)
- `ai-models/` → `https://github.com/Alot1z/ai-models` (AI management)

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
