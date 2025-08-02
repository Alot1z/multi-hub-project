---
trigger: always_on
---

# view_file Implementering
*Komplet implementeringsguide for filvisning*

## 1. Formål og Funktionalitet
`view_file` er et centralt værktøj til visning af filers indhold i Windsurf-miljøet. Dette værktøj muliggør præcis visning af specificerede linjeområder med intelligent konteksthåndtering.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Linjepræcis filvisning
- Kontekstoverblik via sammendrag
- Filmetadata-visning
- Formatgenkendelse
- Robust fejlhåndtering

### 1.2 Integration med Windsurf
Værktøjet integrerer med:
- Filsystemoperationer
- Kodesyntaksforståelse
- Memory-system for kontekst
- Fejlhåndteringsmodul

## 2. Parameter Optimering

### 2.1 AbsolutePath Parameter
- **Sti**: Absolut sti til filen
- **Format**: String
- **Krav**: Skal pege på en eksisterende fil

### 2.2 StartLine Parameter
- **Startlinje**: 0-indekseret linje at starte fra
- **Format**: Number
- **Default**: 0

### 2.3 EndLine Parameter
- **Slutlinje**: 0-indekseret linje at slutte ved (inklusiv)
- **Format**: Number
- **Optimalt**: StartLine + 200 for fuld kontekst

### 2.4 IncludeSummaryOfOtherLines Parameter
- **Sammendrag**: Inkluder sammendrag af andre linjer
- **Format**: Boolean
- **Default**: false

## 3. Anvendelsesmønstre

### 3.1 Fuld Kontekst Visning
```javascript
await view_file({
  AbsolutePath: "/path/to/file.js",
  StartLine: 0,
  EndLine: 200,
  IncludeSummaryOfOtherLines: true
});
```

### 3.2 Specifik Området Visning
```javascript
await view_file({
  AbsolutePath: "/path/to/file.js",
  StartLine: 50,
  EndLine: 70,
  IncludeSummaryOfOtherLines: true
});
```

## 4. Fejlhåndtering

### 4.1 Robusthed
- Implementer filvalidering
- Håndtér linjeområdeoverskridelse
- Validér fileksistens
- Verificer filformat

### 4.2 Fejlforebyggelse
- Tjek filrettigheder
- Validér linjeområder
- Implementer fejlrapportering
- Optimér for store filer