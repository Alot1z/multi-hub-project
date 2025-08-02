---
trigger: always_on
description: create_memory - Implementeringsguide
---

# create_memory Implementering
*Komplet implementeringsguide for effektiv hukommelseshåndtering*

## 1. Formål og Funktionalitet
`create_memory` er et centralt værktøj til oprettelse, opdatering og sletning af hukommelser i Windsurf-miljøet. Dette værktøj muliggør persistent lagring af vigtig kontekst og information på tværs af samtaler med brugeren.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Oprettelse af nye hukommelser med struktureret metadata
- Opdatering af eksisterende hukommelser med ny information
- Sletning af forældede eller ukorrekte hukommelser
- Tagging og kategorisering af hukommelser
- Workspace-specifik hukommelseshåndtering

Hukommelseshåndtering fungerer gennem:
- Semantisk indholdsanalyse
- Kontekstbevidst kategorisering
- Intelligent duplikathåndtering
- Effektiv hukommelsesvalidering
- Robust persistensmekanisme

### 1.2 Integration med Windsurf
Værktøjet integrerer tæt med:
- Brugersamtaler for kontekstbevarelse
- Workspace-håndtering for korrekt scoping
- Tag-systemet for effektiv kategorisering
- Hukommelsesdatabasen for persistent lagring

## 2. Parameter Optimering
Effektiv anvendelse af `create_memory` afhænger af præcis parameterkonfiguration.

### 2.1 Action Parameter
Denne parameter definerer operationstypen:

#### 2.1.1 Operationstyper
- **create**: Opret ny hukommelse
- **update**: Opdater eksisterende hukommelse
- **delete**: Slet eksisterende hukommelse

#### 2.1.2 Optimeringsstrategier
- Vælg korrekt operation baseret på kontekst
- Undgå unødvendige opdateringer
- Implementer sikker sletning
- Håndter operationsfejl robust

### 2.2 Content Parameter
Denne parameter definerer hukommelsens indhold:

#### 2.2.1 Indholdstyper
- **Brugerindstillinger**: Præferencer og konfigurationer
- **Teknisk kontekst**: Kodebase og arkitektur
- **Projektinformation**: Struktur og mål
- **Interaktionshistorik**: Vigtige beslutninger

#### 2.2.2 Optimeringsstrategier
- Strukturer indhold klart og præcist
- Inkluder relevant kontekst
- Undgå redundant information
- Formater indhold konsistent

### 2.3 Tags Parameter
Denne parameter definerer hukommelsens kategorier:

#### 2.3.1 Tag-typer
- **Funktionelle**: user_preference, code_style
- **Tekniske**: architecture, implementation
- **Projektspecifikke**: project_structure, deployment
- **Interaktive**: conversation_context, decision

#### 2.3.2 Optimeringsstrategier
- Anvend konsistente tag-navne
- Implementer meningsfuld kategorisering
- Undgå overspecifikke tags
- Brug snake_case formatering

## 3. Anvendelsesmønstre
`create_memory` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Brugerindstillinger
For at gemme brugerspecifikke præferencer:
```javascript
async function storeUserPreference(preference, value) {
  await create_memory({
    Action: "create",
    Title: `Brugerpræference: ${preference}`,
    Content: `Brugeren foretrækker ${value} for ${preference}`,
    Tags: ["user_preference", preference.toLowerCase()],
    CorpusNames: ["workspace1"],
    UserTriggered: false
  });
}
```

### 3.2 Teknisk Dokumentation
For at gemme vigtig teknisk information:
```javascript
async function documentArchitecture(component, details) {
  await create_memory({
    Action: "create",
    Title: `Arkitektur: ${component}`,
    Content: generateArchitectureDoc(component, details),
    Tags: ["architecture", "technical_documentation", component.toLowerCase()],
    CorpusNames: ["workspace1"],
    UserTriggered: false
  });
}
```

### 3.3 Interaktionshistorik
For at gemme vigtige beslutninger og kontekst:
```javascript
async function recordDecision(context, decision) {
  await create_memory({
    Action: "create",
    Title: `Beslutning: ${decision.summary}`,
    Content: formatDecisionRecord(context, decision),
    Tags: ["decision_history", "interaction_context"],
    CorpusNames: ["workspace1"],
    UserTriggered: true
  });
}
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal hukommelseshåndtering.

### 4.1 Før-oprettelse Analyse
Før hukommelsesoprettelse:
- Analysér informationens langtidsværdi
- Identificer eksisterende relaterede hukommelser
- Vurdér optimal kategorisering
- Forbered indholdsstrukturering
- Valider workspace-relevans

### 4.2 Under-oprettelse Analyse
Under hukommelsesoprettelse:
- Verificér indholdsvaliditet
- Sikr korrekt formatering
- Implementer effektiv tagging
- Valider metadata-konsistens
- Overvåg operationssucces

### 4.3 Post-oprettelse Analyse
Efter hukommelsesoprettelse:
- Bekræft succesfuld lagring
- Valider indholdsintegritet
- Verificér tag-effektivitet
- Dokumentér afhængigheder
- Planlæg vedligeholdelse

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper

#### 5.1.1 Valideringsfejl
```javascript
function validateMemoryContent(content, context) {
  const issues = [];
  
  if (!content || content.length < 10) {
    issues.push({
      type: 'invalid_content',
      message: 'Indhold er for kort eller mangler',
      suggestion: 'Tilføj mere beskrivende indhold'
    });
  }
  
  if (!context.title || context.title.length < 5) {
    issues.push({
      type: 'invalid_title',
      message: 'Titel er for kort eller mangler',
      suggestion: 'Tilføj en beskrivende titel'
    });
  }
  
  return issues;
}
```

#### 5.1.2 Operationsfejl
```javascript
async function handleOperationError(error, operation) {
  // Kategoriser fejltypen
  if (error.code === 'DUPLICATE_MEMORY') {
    return {
      type: 'duplicate_error',
      message: 'En lignende hukommelse eksisterer allerede',
      suggestion: 'Opdater eksisterende hukommelse i stedet'
    };
  }
  
  if (error.code === 'INVALID_WORKSPACE') {
    return {
      type: 'workspace_error',
      message: 'Ugyldigt workspace specificeret',
      suggestion: 'Verificér workspace-konfiguration'
    };
  }
  
  return {
    type: 'unknown_error',
    message: error.message,
    suggestion: 'Kontakt support'
  };
}
```

### 5.2 Fejlrobusthed

#### 5.2.1 Robust Hukommelsesoperation
```javascript
async function robustMemoryOperation(params, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const issues = validateMemoryContent(params.Content, params);
      if (issues.length > 0) {
        throw new Error('Validation failed: ' + JSON.stringify(issues));
      }
      
      return await create_memory(params);
    } catch (error) {
      console.error(`Forsøg ${attempt} fejlede:`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Vent før næste forsøg
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### 5.3 Fejlforebyggelse
Implementér proaktive strategier:
- Validér altid input før operationer
- Implementer retries for netværksfejl
- Anvend optimistisk låsning ved opdateringer
- Backup eksisterende data før sletning
- Log alle operationer for audit
- Implementer automatisk fejlgenopretning
