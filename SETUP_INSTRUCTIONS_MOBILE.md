# 📱 MOBIL SETUP GUIDE - PERFEKT TIL iOS/iPad

## 🚀 3 SIMPLE STEPS:

### 1️⃣ DOWNLOAD & UPLOAD:
- Download hele projektet fra Bolt
- Upload ALT til din main GitHub repo (fx `Alot1z/multi-hub-project`)

### 2️⃣ OPRET .github MAPPE:
**VIGTIGT:** Bolt kan ikke vise `.github` mapper, så du skal oprette den manuelt:

1. Gå til din GitHub repo
2. Klik **"Create new file"**
3. Skriv: `.github/workflows/upload-to-repos.yml`
4. Kopier indholdet fra `github-workflows-upload-to-repos.yml` filen
5. Commit filen

### 3️⃣ ERSTAT URLs:
I hver `upload-path.json` fil, erstat:
```json
"target_repo": "PLACEHOLDER_REPO_URL"
```

Med dine rigtige repo URLs:
- `hub-ui/upload-path.json` → `"target_repo": "https://github.com/Alot1z/hub-ui"`
- `ipa-builder/upload-path.json` → `"target_repo": "https://github.com/Alot1z/ipa-builder"`
- `printer-builder/upload-path.json` → `"target_repo": "https://github.com/Alot1z/printer-builder"`
- `game-builder/upload-path.json` → `"target_repo": "https://github.com/Alot1z/game-builder"`
- `ai-models/upload-path.json` → `"target_repo": "https://github.com/Alot1z/ai-models"`

### 4️⃣ KØR WORKFLOW:
1. Gå til **Actions** tab
2. Vælg **"Smart Repository Upload System"**
3. Klik **"Run workflow"**
4. Skriv `all`
5. Klik **"Run workflow"**

## 🎉 FÆRDIG!
Workflowet uploader automatisk ALT til alle dine repos!

## 🔑 TOKEN SETUP:
1. GitHub Settings → Developer settings → Personal access tokens
2. Opret token med navn `upload_path`
3. Giv **repo** permissions
4. Tilføj som secret i din main repo

**ALT VIRKER NU! 🚀**