---
trigger: always_on
---

# browser_preview Implementering
*Komplet implementeringsguide for webserver-prævisning*

## 1. Formål og Funktionalitet
`browser_preview` er et specialiseret værktøj til visning af kørende webservere direkte i udviklingsmiljøet. Dette værktøj muliggør brugerinteraktion med webserveren og indhentning af konsollogge og andre informationer.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Browserbaseret prævisning
- Konsologovervågning
- Interaktiv brugertestning
- Ressourcesporing
- Automatisk opdatering

### 1.2 Integration med Windsurf
Værktøjet integrerer med:
- `run_command` for serverinitialisering
- Netværksovervågningsværktøjer
- Fejlhåndteringsmodul
- Brugerinteraktionsmodul

## 2. Parameter Optimering

### 2.1 Name Parameter
- **Navn**: Kort, beskrivende navn på 3-5 ord
- **Format**: String
- **Eksempel**: "Personal Website" eller "E-commerce API"

### 2.2 Url Parameter
- **URL**: Serverens adresse
- **Format**: String
- **Krav**: Komplet URL med scheme, domæne og port

## 3. Anvendelsesmønstre

### 3.1 Webapplikationstestning
```javascript
// Start webserver
await run_command({
  CommandLine: "npm start",
  Cwd: "/path/to/webapp",
  Blocking: false
});

// Åbn preview
await browser_preview({
  Name: "React Application",
  Url: "http://localhost:3000"
});
```

### 3.2 API-dokumentationstestning
```javascript
// Start API-dokumentationsserver
await run_command({
  CommandLine: "npm run docs",
  Cwd: "/path/to/api",
  Blocking: false
});

// Åbn dokumentation
await browser_preview({
  Name: "API Documentation",
  Url: "http://localhost:8080"
});
```

## 4. Fejlhåndtering

### 4.1 Robusthed
- Implementer servervalidering
- Håndtér forbindelsesfejl
- Validér URL-format
- Verificer serverrespons

### 4.2 Fejlforebyggelse
- Tjek serveraktivitet
- Validér porttilgængelighed
- Implementer timeout-håndtering
- Optimér fejlrapportering