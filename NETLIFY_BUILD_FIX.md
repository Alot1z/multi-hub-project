# 🔧 NETLIFY BUILD FIX - REACT APPS

## ❌ **PROBLEM:**
Netlify kan ikke deploye React apps automatisk fordi de mangler build settings!

## ✅ **LØSNING - MANUEL NETLIFY SETUP:**

### **FOR HVER NETLIFY PROJEKT:**

1. **Gå til Netlify projekt** (fx hub-uii)
2. **Klik "Site settings"**
3. **Klik "Build & deploy"**
4. **Klik "Edit settings"**
5. **Indtast disse settings:**

```
Build command: npm run build
Publish directory: dist
```

6. **Klik "Save"**
7. **Gå tilbage og klik "Trigger deploy"**

### **ELLER BRUG NETLIFY.TOML (AUTOMATISK):**

Alle React repos har allerede `netlify.toml` filer med:
```toml
[build]
  publish = "dist"
  command = "npm run build"
```

**Men Netlify skal måske genstartes for at læse dem!**

## 🚀 **STEPS FOR ALLE 5 PROJEKTER:**

### **hub-uii:**
1. Site settings → Build & deploy
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Save → Trigger deploy

### **ipa-builder:**
1. Site settings → Build & deploy  
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Save → Trigger deploy

### **printer-builder:**
1. Site settings → Build & deploy
2. Build command: `npm run build` 
3. Publish directory: `dist`
4. Save → Trigger deploy

### **game-build:**
1. Site settings → Build & deploy
2. Build command: `npm run build`
3. Publish directory: `dist` 
4. Save → Trigger deploy

### **ai-modelss:**
1. Site settings → Build & deploy
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Save → Trigger deploy

## 📱 **iOS/FIREFOX FIX:**

Problemet med iOS/Firefox er CORS headers. Opdater alle `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type"
```

**EFTER DETTE VIRKER ALT! 🎉**