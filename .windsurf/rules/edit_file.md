---
trigger: always_on
---

# edit_file Implementering
*Komplet implementeringsguide for effektiv filredigering*

## 1. Formål og Funktionalitet
`edit_file` er et kraftfuldt værktøj til sikker og præcis redigering af filer i Windsurf-miljøet. Dette værktøj muliggør atomiske filændringer med automatisk validering og fejlhåndtering.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Præcis filredigering med versionskontrol
- Automatisk backup før ændringer
- Intelligent ændringsvalidering
- Robust fejlhåndtering
- Effektiv ændringsdokumentation

Filredigering fungerer gennem:
- Sikker filsystemintegration
- Atomiske ændringsoperationer
- Intelligent indholdsvalidering
- Automatisk formatbevarelse
- Detaljeret ændringslog

### 1.2 Integration med Windsurf
Værktøjet integrerer tæt med:
- `view_file` for indholdsvalidering
- `write_to_file` for nye filer
- `replace_file_content` for store ændringer
- Fejlhåndteringsmodulet for robust drift

## 2. Parameter Optimering
Effektiv anvendelse af `edit_file` afhænger af præcis parameterkonfiguration.

### 2.1 TargetFile Parameter
Denne parameter definerer målfilen:

#### 2.1.1 Filspecifikationer
- **Absolut sti**: Komplet sti fra rodmappen
- **Fileksistens**: Skal eksistere
- **Filrettigheder**: Skal være skrivbar
- **Filformat**: Alle tekstformater

#### 2.1.2 Optimeringsstrategier
- Anvend absolutte stier
- Validér fileksistens
- Tjek filrettigheder
- Implementer formatvalidering

### 2.2 CodeEdit Parameter
Denne parameter definerer ændringerne:

#### 2.2.1 Ændringstyper
- **Tilføjelser**: Ny kode eller tekst
- **Ændringer**: Eksisterende indhold
- **Sletninger**: Fjernelse af indhold
- **Formatering**: Strukturændringer

#### 2.2.2 Optimeringsstrategier
- Gruppér relaterede ændringer
- Bevar formatering
- Validér syntaks
- Dokumentér ændringer

## 3. Anvendelsesmønstre
`edit_file` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Koderedigering
For præcis koderedigering:
```javascript
await edit_file({
  TargetFile: '/path/to/file.js',
  CodeEdit: 'function newFeature() { /* ... */ }',
  Instruction: 'Tilføjer ny funktionalitet'
});
```

### 3.2 Dokumentopdatering
For dokumentvedligeholdelse:
```javascript
await edit_file({
  TargetFile: '/path/to/doc.md',
  CodeEdit: '## Ny Sektion\n\nIndhold...',
  Instruction: 'Tilføjer ny dokumentationssektion'
});
```

### 3.3 Konfigurationsændring
For sikker konfigurationsopdatering:
```javascript
await edit_file({
  TargetFile: '/path/to/config.json',
  CodeEdit: JSON.stringify(newConfig, null, 2),
  Instruction: 'Opdaterer konfiguration'
});
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal filredigering.

### 4.1 Før-redigering Analyse
Før filredigering:
- Validér filsti og -tilstand
- Analysér eksisterende indhold
- Planlæg ændringsstrategi
- Forbered fejlhåndtering

### 4.2 Under-redigering Analyse
Under filredigering:
- Overvåg ændringsproces
- Validér delresultater
- Håndtér fejltilstande
- Implementer checkpoints

### 4.3 Post-redigering Analyse
Efter filredigering:
- Verificér ændringer
- Validér filintegritet
- Dokumentér resultater
- Planlæg opfølgning

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper
- Ugyldige stier
- Manglende rettigheder
- Syntaksfejl
- Formateringsfejl

### 5.2 Fejlrobusthed
- Implementer retries
- Validér input
- Håndtér timeouts
- Bevar konsistens

### 5.3 Fejlforebyggelse
- Tjek parametre
- Validér indhold
- Implementer logging
- Optimér backup
*Komplet implementeringsguide for filredigering*

## 1. Formål og Funktionalitet
`edit_file` er et kraftfuldt værktøj til sikker og præcis redigering af eksisterende filer i Windsurf-miljøet. Dette værktøj muliggør effektiv og kontrolleret ændring af filindhold med omfattende fejlhåndtering.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Præcis filindholdsredigering
- Atomar operationsudførelse
- Automatisk backup før ændring
- Formatgenkendelse og -bevaring
- Robust fejlhåndtering

### 1.2 Integration med Windsurf
Værktøjet integrerer med:
- Filsystemoperationer
- `view_file` for kontekstanalyse
- `replace_file_content` for specifikke ændringer
- Fejlhåndteringsmodul

## 2. Parameter Optimering

### 2.1 FilePath Parameter
- **Sti**: Absolut sti til filen
- **Format**: String
- **Krav**: Skal pege på en eksisterende fil

### 2.2 EditContent Parameter
- **Indhold**: Nyt filindhold eller ændringsspecifikation
- **Format**: String eller objektspecifikation
- **Krav**: Komplette ændringer i én operation

## 3. Anvendelsesmønstre

### 3.1 Komplet Filredigering
```javascript
await edit_file({
  FilePath: "/path/to/file.js",
  EditContent: "// New file content\nfunction example() {\n  return true;\n}"
});
```

### 3.2 Sektionsredigering
```javascript
await edit_file({
  FilePath: "/path/to/file.js",
  EditContent: {
    section: "functionName",
    newContent: "function functionName() {\n  return 'updated';\n}"
  }
});
```

## 4. Fejlhåndtering

### 4.1 Robusthed
- Implementer automatisk backup
- Håndtér skriveadgangsproblemer
- Validér indholdsformat
- Verificer ændringsresultat

### 4.2 Fejlforebyggelse
- Tjek fileksistens
- Validér formatændringer
- Implementer versionssammenligning
- Optimér atomar skrivning