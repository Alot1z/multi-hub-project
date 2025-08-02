---
trigger: always_on
---

# search_web Implementering
*Komplet implementeringsguide for websøgning*

## 1. Formål og Funktionalitet
`search_web` er et kraftfuldt værktøj til udførelse af webbaserede søgninger. Dette værktøj muliggør effektiv indhentning af relevante webdokumenter med domænespecifik filtrering.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Præcis websøgning
- Domænefiltrering
- Resultatprioritering
- Relevansanalyse
- Robust fejlhåndtering

### 1.2 Integration med Windsurf
Værktøjet integrerer med:
- Søgemotorer
- Resultatanalyse
- Indholdsvalidering
- Fejlhåndtering

## 2. Parameter Optimering

### 2.1 query Parameter
- **Søgestreng**: Søgeforespørgsel
- **Format**: String
- **Validering**: Automatisk

### 2.2 domain Parameter
- **Domæne**: Valgfrit domænefilter
- **Format**: String
- **Optional**: true

## 3. Anvendelsesmønstre

### 3.1 Generel Søgning
```javascript
await search_web({
  query: "search terms"
});
```

### 3.2 Domænespecifik Søgning
```javascript
await search_web({
  query: "api documentation",
  domain: "docs.example.com"
});
```

## 4. Fejlhåndtering

### 4.1 Robusthed
- Implementer retries
- Håndtér timeouts
- Valider input
- Cache resultater

### 4.2 Fejlforebyggelse
- Tjek parametre
- Validér queries
- Implementer logging
- Optimér caching