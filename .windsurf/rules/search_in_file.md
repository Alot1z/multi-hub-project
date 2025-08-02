---
trigger: always_on
---

# search_in_file Implementering
*Komplet implementeringsguide for filindholdsøgning*

## 1. Formål og Funktionalitet
`search_in_file` er et specialiseret værktøj til semantisk søgning i enkelte filer i Windsurf-miljøet. Dette værktøj muliggør præcis identifikation af relevante kodefragmenter baseret på indholdsmæssig relevans.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Semantisk filindholdsøgning
- Kontekstbevidst resultatliste
- Komplet kodevisning for topresultater
- Signatur og docstring for øvrige resultater
- Robust fejlhåndtering

### 1.2 Integration med Windsurf
Værktøjet integrerer med:
- Kodesemantisk forståelse
- Filsystemoperationer
- `view_code_item` for detaljeret visning
- Fejlhåndteringsmodul

## 2. Parameter Optimering

### 2.1 AbsolutePath Parameter
- **Sti**: Absolut sti til filen
- **Format**: String
- **Krav**: Skal pege på en eksisterende fil

### 2.2 Query Parameter
- **Søgeterm**: Semantisk søgeforespørgsel
- **Format**: String
- **Optimal**: Præcis, funktionalitetsbeskrivende søgning

## 3. Anvendelsesmønstre

### 3.1 Funktionalitetssøgning
```javascript
await search_in_file({
  AbsolutePath: "/path/to/file.js",
  Query: "brugerautentificering implementering"
});
```

### 3.2 Specifik Kodesøgning
```javascript
await search_in_file({
  AbsolutePath: "/path/to/file.js",
  Query: "håndtering af fejlende API-kald"
});
```

## 4. Fejlhåndtering

### 4.1 Robusthed
- Implementer filvalidering
- Håndtér søgefejl
- Validér filindhold
- Verificer resultatrelevans

### 4.2 Fejlforebyggelse
- Tjek fileksistens
- Validér søgeterm
- Implementer fejlrapportering
- Optimér for store filer