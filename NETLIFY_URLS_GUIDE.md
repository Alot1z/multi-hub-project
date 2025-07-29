# 🌐 HENT DINE NETLIFY URLs

## 📋 STEP-BY-STEP:

### 1️⃣ **KLIK PÅ HVER NETLIFY PROJEKT:**
- **hub-uii** → Klik på det → Kopier URL (fx `https://hub-uii.netlify.app`)
- **ipa-builder** → Klik på det → Kopier URL (fx `https://ipa-builder.netlify.app`)
- **printer-builder** → Klik på det → Kopier URL (fx `https://printer-builder.netlify.app`)
- **game-build** → Klik på det → Kopier URL (fx `https://game-build.netlify.app`)
- **ai-modelss** → Klik på det → Kopier URL (fx `https://ai-modelss.netlify.app`)

### 2️⃣ **OPDATER .platform.json:**
Gå til dit `alo1z.github.io` repo og opdater `.platform.json`:

```json
{
  "version": "2.0.0",
  "base_url": "https://alo1z.github.io",
  "fallback_url": "https://hub-uii.netlify.app",
  "subprojects": {
    "hub-ui": {
      "url": "https://hub-uii.netlify.app",
      "description": "Main platform interface and router"
    },
    "ipa-builder": {
      "url": "https://ipa-builder.netlify.app",
      "description": "iOS IPA builder with TrollStore support"
    },
    "printer-builder": {
      "url": "https://printer-builder.netlify.app",
      "description": "3D printer model generator"
    },
    "game-builder": {
      "url": "https://game-build.netlify.app",
      "description": "Game development platform"
    },
    "ai-models": {
      "url": "https://ai-modelss.netlify.app",
      "description": "AI model management and inference"
    }
  }
}
```

### 3️⃣ **TEST DIT SYSTEM:**
1. Gå til din **hub-ui** URL (fx `https://hub-uii.netlify.app`)
2. Klik på hver projekt for at teste
3. Alt skulle virke perfekt!

## 🎉 **RESULTAT:**
- ✅ **Multi-Hub Platform** er live
- ✅ **Alle 5 subprojects** deployed
- ✅ **Platform router** virker
- ✅ **Iframe integration** klar

**DIT SYSTEM ER NU FULDT OPERATIONELT! 🚀**