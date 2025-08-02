---
trigger: always_on
description: read_resource - Resource Læsnings Guide
---

# read_resource Implementering
*Komplet implementeringsguide for ressourcelæsning*

## 1. Formål og Funktionalitet
`read_resource` er et specialiseret værktøj til læsning af ressourceindhold fra MCP-servere i Windsurf-miljøet. Dette værktøj muliggør effektiv og sikker indhentning af ressourcedata gennem standardiserede identifikatorer.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Præcis ressourceindhentning via URI
- Server-specifik ressourcelæsning
- Effektiv ressourcehåndtering
- Robust fejlhåndtering
- Indholdsvalidering

Ressourcelæsning fungerer gennem:
- Server-baseret ressourceidentifikation
- Intelligent indholdshåndtering
- Automatisk indholdsvalidering
- Sikker dataindhentning
- Fejltolerant kommunikation

### 1.2 Integration med Windsurf
Værktøjet integrerer tæt med:
- `list_resources` for ressourceidentifikation
- `view_content_chunk` for indholdsvisning
- Memory-systemet for ressourcecaching
- Fejlhåndteringsmodulet for robust drift

## 2. Parameter Optimering
Effektiv anvendelse af `read_resource` afhænger af præcis parameterkonfiguration.

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

### 2.2 Uri Parameter
Denne parameter definerer ressourcens identifikator:

#### 2.2.1 URI-typer
- **Direkte URI'er**: Præcise ressourceidentifikatorer
- **Relative URI'er**: Kontekstafhængige identifikatorer
- **Virtuelle URI'er**: Abstrakte ressourcehenvisninger
- **Cache URI'er**: Cache-specifikke identifikatorer

#### 2.2.2 Optimeringsstrategier
- Anvend præcise URI'er når muligt
- Implementer URI-normalisering
- Håndtér URI-opslag effektivt
- Validér URI'er før brug

## 3. Anvendelsesmønstre
`read_resource` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Direkte Ressourcelæsning
For simpel ressourceindhentning:
```javascript
async function readDirectResource(server, uri) {
  try {
    // Læs ressource
    const resource = await read_resource({
      ServerName: server,
      Uri: uri
    });
    
    // Validér ressourceindhold
    if (validateResource(resource)) {
      return {
        success: true,
        content: resource.content,
        metadata: resource.metadata
      };
    } else {
      throw new Error('Ugyldig ressource');
    }
  } catch (error) {
    return handleResourceError(error);
  }
}
```

### 3.2 Cachebaseret Læsning
For effektiv ressourcehåndtering med caching:
```javascript
async function readCachedResource(server, uri) {
  // Tjek cache først
  const cached = await checkResourceCache(uri);
  if (cached && !isCacheExpired(cached)) {
    return {
      success: true,
      content: cached.content,
      source: 'cache'
    };
  }
  
  // Læs fra server hvis ikke i cache
  try {
    const resource = await read_resource({
      ServerName: server,
      Uri: uri
    });
    
    // Gem i cache
    await cacheResource(uri, resource);
    
    return {
      success: true,
      content: resource.content,
      source: 'server'
    };
  } catch (error) {
    // Returner udløbet cache ved fejl hvis tilgængelig
    if (cached) {
      return {
        success: true,
        content: cached.content,
        source: 'expired_cache'
      };
    }
    throw error;
  }
}
```

### 3.3 Fejltolerant Ressourcelæsning
For robust ressourcehåndtering:
```javascript
async function readResourceWithRetry(server, uri, options = {}) {
  const { retries = 3, backoff = 1000 } = options;
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      const resource = await read_resource({
        ServerName: server,
        Uri: uri
      });
      
      return {
        success: true,
        content: resource.content,
        attempts: attempt + 1
      };
    } catch (error) {
      attempt++;
      
      if (attempt >= retries) {
        return {
          success: false,
          error: error.message,
          attempts: retries
        };
      }
      
      // Vent med eksponentiel backoff
      await new Promise(resolve =>
        setTimeout(resolve, backoff * Math.pow(2, attempt))
      );
    }
  }
}
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal ressourcelæsning.

### 4.1 Før-læsning Analyse
Før ressourcelæsning:
- Validér server og URI
- Tjek cache-status
- Estimér ressourcestørrelse
- Planlæg fejlhåndtering

### 4.2 Under-læsning Analyse
Under ressourcelæsning:
- Overvåg serverresponstider
- Spor ressourceforbrug
- Optimér caching
- Håndtér delfejl

### 4.3 Post-læsning Analyse
Efter ressourcelæsning:
- Evaluer ressourcekvalitet
- Validér indholdsintegritæt
- Opdater cache-statistik
- Planlæg optimeringstiltag

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper

#### 5.1.1 Ressourcefejl
```javascript
function handleResourceError(error) {
  // Kategorisér fejltypen
  if (error.code === 'RESOURCE_NOT_FOUND') {
    return {
      type: 'missing_resource',
      message: 'Ressource ikke fundet',
      suggestion: 'Verificér URI'
    };
  }
  
  if (error.code === 'SERVER_UNAVAILABLE') {
    return {
      type: 'server_error',
      message: 'Server utilgængelig',
      suggestion: 'Prøv alternativ server'
    };
  }
  
  return {
    type: 'unknown_error',
    message: error.message,
    suggestion: 'Kontakt support'
  };
}
```

#### 5.1.2 Indholdsfejl
```javascript
function validateResourceContent(content) {
  // Validér ressourceindhold
  const issues = [];
  
  if (!content || content.length === 0) {
    issues.push('Tomt ressourceindhold');
  }
  
  if (content && !isValidEncoding(content)) {
    issues.push('Ugyldig indholdsencoding');
  }
  
  return issues;
}
```

### 5.2 Fejlrobusthed

#### 5.2.1 Genopretningsstrategier
```javascript
function implementRecoveryStrategy(error, context) {
  // Implementér fejlgenopretning
  switch (error.code) {
    case 'CACHE_MISS':
      return readFromServer(context); // Forsøg direkte serverlæsning
    case 'CORRUPT_CONTENT':
      return revalidateResource(context); // Genvalidér ressource
    default:
      return handleGenericError(error);
  }
}
```

### 5.3 Fejlforebyggelse
Implementér proaktive strategier:
- Validér ressource-URI'er før brug
- Implementér intelligent caching
- Anvend ressourcevalidering
- Implementér circuit breakers
