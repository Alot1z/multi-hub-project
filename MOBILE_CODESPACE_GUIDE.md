# 📱 MOBIL CODESPACE GUIDE - iPad/iPhone

## 🚀 PERFEKT TIL MOBIL UPLOAD!

### 📱 **ÅBEN CODESPACE PÅ MOBIL:**
1. Gå til `github.com/Alot1z/multi-hub-project` i Safari/Chrome
2. Tryk **"Code"** → **"Codespaces"** → **"Create codespace"**
3. Vent 30 sekunder - fuld Linux computer i browseren! 🎉

### 📁 **UPLOAD FILER (2 METODER):**

#### **METODE 1: File Upload (Nemmest)**
1. I Codespace, klik **Explorer** ikonet (📁) til venstre
2. Højreklik i file listen → **"Upload..."**
3. Vælg din ZIP fil fra Downloads
4. Filen uploades automatisk!

#### **METODE 2: Terminal Download**
```bash
# Hvis du har et link til ZIP filen
curl -L "DIT_ZIP_LINK" -o project.zip
unzip project.zip
```

### 📝 **EDIT FILER PÅ MOBIL:**
1. Klik på en fil i Explorer (fx `hub-ui/upload-path.json`)
2. Filen åbnes i editor
3. Ændre `"PLACEHOLDER"` til `"https://github.com/Alot1z/hub-ui"`
4. **Ctrl+S** (eller **Cmd+S** på iOS) for at gemme

### ⚡ **HURTIG EDIT AF ALLE URLs:**
Copy-paste denne kommando i terminal:
```bash
# Ændre alle på én gang (tilpas dine repo navne)
sed -i 's/PLACEHOLDER/https:\/\/github.com\/Alot1z\/hub-ui/g' hub-ui/upload-path.json
sed -i 's/PLACEHOLDER/https:\/\/github.com\/Alot1z\/ipa-builder/g' ipa-builder/upload-path.json
sed -i 's/PLACEHOLDER/https:\/\/github.com\/Alot1z\/printer-builder/g' printer-builder/upload-path.json
sed -i 's/PLACEHOLDER/https:\/\/github.com\/Alot1z\/game-builder/g' game-builder/upload-path.json
sed -i 's/PLACEHOLDER/https:\/\/github.com\/Alot1z\/ai-models/g' ai-models/upload-path.json
```

### 📤 **COMMIT FRA MOBIL:**
1. Klik **Source Control** ikonet (🌿) til venstre
2. Skriv commit besked: `🚀 Upload complete project`
3. Klik **✓ Commit**
4. Klik **↑ Push** (eller **Sync Changes**)

### 🎯 **ALTERNATIV - TERMINAL COMMIT:**
```bash
git add .
git commit -m "🚀 Complete upload from mobile"
git push origin main
```

### 🔑 **SETUP TOKEN PÅ MOBIL:**
1. Åben ny tab → `github.com/settings/tokens`
2. **"Generate new token (classic)"**
3. Navn: `UPLOAD_PATH`
4. Vælg **repo** checkbox
5. **"Generate token"** → kopier token
6. Gå til din repo → **Settings** → **Secrets** → **Actions**
7. **"New repository secret"**
8. Name: `UPLOAD_PATH`, Value: din token

### 🚀 **RUN WORKFLOW FRA MOBIL:**
1. Gå til **Actions** tab i din repo
2. Vælg **"🚀 Ultra Simple Upload System"**
3. **"Run workflow"** → skriv `all`
4. **"Run workflow"** → vent på grøn checkmark ✅

## 📱 **MOBIL TIPS:**

### **iPad Optimering:**
- Brug **Split View** - GitHub i ene side, Codespace i anden
- **External keyboard** gør det endnu nemmere
- **Safari** virker bedst til Codespace

### **iPhone Optimering:**
- **Landscape mode** giver mere plads
- **Zoom ind** på kode for bedre læsbarhed
- **Copy-paste** virker perfekt

### **Offline Arbejde:**
- Codespace kører i skyen - kræver internet
- Men alle ændringer gemmes automatisk
- Kan lukke browser og fortsætte senere

## 🎉 **RESULTAT:**
- ✅ **Komplet projekt uploaded** fra mobil
- ✅ **Alle repos konfigureret** til auto-upload
- ✅ **Workflow klar** til deployment
- ✅ **Perfekt til ferie** - alt styres fra telefon!

**MOBIL DEVELOPMENT MADE EASY! 📱🚀**