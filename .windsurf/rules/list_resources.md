---
trigger: always_on
---

# list_resources Implementering
*Komplet implementeringsguide for effektiv ressourcelistning*

## 1. Formål og Funktionalitet
`list_resources` er et specialiseret værktøj til listning af tilgængelige ressourcer fra MCP-servere i Windsurf-miljøet. Dette værktøj muliggør effektiv identifikation og håndtering af serverressourcer med automatisk paginering.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Komplet ressourceoversigt
- Automatisk paginering
- Serverspecifik ressourceidentifikation
- Effektiv resultatfiltrering
- Robust fejlhåndtering

Ressourcelistning fungerer gennem:
- Server-baseret ressourceidentifikation
- Intelligent pagineringslogik
- Automatisk resultatvalidering
- Sikker dataindhentning
- Fejltolerant kommunikation

### 1.2 Integration med Windsurf
Værktøjet integrerer tæt med:
- `read_resource` for ressourceindhentning
- `view_content_chunk` for indholdsvisning
- Memory-systemet for ressourcecaching
- Fejlhåndteringsmodulet for robust drift

## 2. Parameter Optimering
Effektiv anvendelse af `list_resources` afhænger af præcis parameterkonfiguration.

### 2.1 ServerName Parameter
Denne parameter definerer MCP-serveren:

#### 2.1.1 Servertyper
- **Ressourceservere**: Primære ressourcelagre
- **Cacheservere**: Lokale ressourcecaches
- **Proxyservere**: Ressourceproxyer
- **Specialservere**: Domænespecifikke servere

#### 2.1.2 Optimeringsstrategier
- Vælg server baseret på ressourcetype
- Anvend caching når muligt
- Implementer failover-mekanismer
- Optimér servervalg baseret på tilgængelighed

### 2.2 Cursor Parameter
Denne parameter håndterer paginering:

#### 2.2.1 Cursortyper
- **Null**: Første side af resultater
- **Pagineringstoken**: Næste resultatside
- **Specialcursors**: Serverspecifikke tokens
- **Offset-baserede**: Numeriske offsets

#### 2.2.2 Optimeringsstrategier
- Håndtér cursors effektivt
- Implementer cursor-caching
- Validér cursor-gyldighed
- Optimér pagineringsflow

## 3. Anvendelsesmønstre
`list_resources` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Komplet Ressourcelisting
For fuld ressourceoversigt:
```javascript
async function listAllResources(server) {
  let cursor = null;
  const resources = [];
  
  while (true) {
    const result = await list_resources({
      ServerName: server,
      Cursor: cursor
    });
    
    resources.push(...result.resources);
    
    if (!result.nextCursor) break;
    cursor = result.nextCursor;
  }
  
  return resources;
}
```

### 3.2 Filtreret Ressourcesøgning
For målrettet ressourceindhentning:
```javascript
async function findSpecificResources(server, filter) {
  const result = await list_resources({
    ServerName: server,
    Filter: filter
  });
  
  return result.resources.filter(r => 
    matchesFilter(r, filter)
  );
}
```

### 3.3 Effektiv Paginering
For optimeret resultatindhentning:
```javascript
async function paginateResources(server, pageSize = 100) {
  let cursor = null;
  
  const getNextPage = async () => {
    const result = await list_resources({
      ServerName: server,
      Cursor: cursor,
      PageSize: pageSize
    });
    
    cursor = result.nextCursor;
    return result.resources;
  };
  
  return {
    hasMore: () => cursor !== null,
    getNext: getNextPage
  };
}
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal ressourcelistning.

### 4.1 Før-listning Analyse
Før ressourcelistning:
- Validér servertilgængelighed
- Estimér ressourcemængde
- Planlæg pagineringsstrategi
- Forbered resultatvalidering

### 4.2 Under-listning Analyse
Under ressourcelistning:
- Overvåg serverrespons
- Validér ressourcedata
- Optimér pagineringsflow
- Håndtér delfejl

### 4.3 Post-listning Analyse
Efter ressourcelistning:
- Verificér datakomplethed
- Validér ressourceintegritét
- Optimér caching
- Planlæg opfølgning

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper
- Serverfejl
- Pagineringsfejl
- Timeout-fejl
- Valideringsfejl

### 5.2 Fejlrobusthed
- Implementer retries
- Validér input
- Håndtér timeouts
- Bevar konsistens

### 5.3 Fejlforebyggelse
- Tjek parametre
- Validér servertilstand
- Implementer logging
- Optimér ressourceforbrug
*Komplet implementeringsguide for ressourcelisting*

## 1. Formål og Funktionalitet
`list_resources` er et specialiseret værktøj til visning af tilgængelige ressourcer fra MCP-servere i Windsurf-miljøet. Dette værktøj muliggør effektiv identifikation og navigation af server-ressourcer.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Komplet ressourceoversigt
- Server-specifik ressourcelisting
- Pagineret resultatvisning
- Cursorbaseret navigation
- Robust fejlhåndtering

### 1.2 Integration med Windsurf
Værktøjet integrerer med:
- MCP-serverarkitektur
- Ressourcehåndtering
- Fejlhåndtering
- Tilstandsbevarelse

## 2. Parameter Optimering

### 2.1 ServerName Parameter
- **Server**: MCP-servernavn
- **Format**: String
- **Krav**: Skal være gyldig MCP-server

### 2.2 Cursor Parameter
- **Cursor**: Paginerings-cursor
- **Format**: String
- **Optional**: true
- **Formål**: Fortsættelse af store resultatsæt

## 3. Anvendelsesmønstre

### 3.1 Simpel Ressourcelisting
```javascript
await list_resources({
  ServerName: "resource-server"
});
```

### 3.2 Pagineret Ressourcenavigation
```javascript
// Initial listing
const initialListing = await list_resources({
  ServerName: "resource-server"
});

// Fortsæt listing hvis flere ressourcer
if (initialListing.hasMoreResults) {
  const nextPage = await list_resources({
    ServerName: "resource-server",
    Cursor: initialListing.cursor
  });
}
```

## 4. Fejlhåndtering

### 4.1 Robusthed
- Implementer server-validering
- Håndtér server-timeout
- Valider ressourcetilgængelighed
- Verificer cursor-gyldighed

### 4.2 Fejlforebyggelse
- Tjek server-tilgængelighed
- Validér cursor-format
- Implementer fejlrapportering
- Optimér for store ressourcesæt