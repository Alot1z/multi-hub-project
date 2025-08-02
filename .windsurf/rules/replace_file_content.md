---
trigger: always_on
---

# replace_file_content Implementering
*Komplet implementeringsguide for filindholdsudskiftning*

## 1. Formål og Funktionalitet
`replace_file_content` er et kraftfuldt værktøj til kontrolleret redigering af eksisterende filer i Windsurf-miljøet. Dette værktøj muliggør præcis ændring af specifikke dele af filindhold gennem målrettede erstatningsstumper.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Præcis indholdsudskiftning
- Sektionshåndtering
- Multiple ændringer i én operation
- Fejlhåndtering
- Tilstandsvalidering

### 1.2 Integration med Windsurf
Værktøjet integrerer med:
- Filsystemhåndtering
- Indholdscaching
- Fejlrapportering
- Tilstandsbevarelse

## 2. Parameter Optimering

### 2.1 TargetFile Parameter
- **Sti**: Absolut filsti
- **Format**: String
- **Krav**: Skal specificeres først

### 2.2 ReplacementChunks Parameter
- **Stumper**: Array af ændringsstumper
- **Struktur**: TargetContent, ReplacementContent, AllowMultiple
- **Format**: Array of objects

### 2.3 Instruction Parameter
- **Instruktion**: Beskrivelse af ændringer
- **Format**: String
- **Formål**: Dokumentation

## 3. Anvendelsesmønstre

### 3.1 Enkelt Erstatning
```javascript
await replace_file_content({
  TargetFile: "/path/to/file.js",
  ReplacementChunks: [{
    TargetContent: "function oldName() {",
    ReplacementContent: "function newName() {",
    AllowMultiple: false
  }],
  Instruction: "Omdøb funktion"
});
```

### 3.2 Multiple Ændringer
```javascript
await replace_file_content({
  TargetFile: "/path/to/file.js",
  ReplacementChunks: [
    {
      TargetContent: "const oldVar = 5;",
      ReplacementContent: "const newVar = 10;",
      AllowMultiple: false
    },
    {
      TargetContent: "function process() {",
      ReplacementContent: "function processData() {",
      AllowMultiple: false
    }
  ],
  Instruction: "Variabel- og funktionsnavnsændringer"
});
```

## 4. Fejlhåndtering

### 4.1 Robusthed
- Implementer backup
- Håndtér indholdsvalidering
- Valider eksistens
- Verificer tilstand

### 4.2 Fejlforebyggelse
- Tjek målindhold
- Validér erstatningsformat
- Implementer atomar ændring
- Optimér for store filer