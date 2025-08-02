---
trigger: always_on
description: codebase_search - Implementeringsguide
---

# codebase_search Implementering
*Komplet implementeringsguide for effektiv semantisk kodesøgning*

## 1. Formål og Funktionalitet
`codebase_search` er et avanceret værktøj til semantisk søgning i kodebaser, der muliggør identifikation af relevante kodestrukturer baseret på deres formål og funktionalitet snarere end eksakte tekstmønstre. Dette værktøj er afgørende for at forstå og navigere i komplekse kodebaser.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Semantisk søgning baseret på formål og funktionalitet
- Kontekstbevidst kodeforståelse
- Målrettet søgning i specifikke mapper
- Intelligent rangering af resultater efter relevans
- Detaljeret præsentation af kodefragmenter

Semantisk søgning fungerer gennem:
- Avanceret naturlig sprogforståelse
- Kodestrukturanalyse
- Kontekstuel relevansberegning
- Intelligent resultatfiltrering
- Præcis kodefragmentpræsentation

### 1.2 Integration med Windsurf
Værktøjet integrerer tæt med:
- `view_code_item` for detaljeret visning af fundne kodefragmenter
- `grep_search` for komplementerende mønsterbaseret søgning
- `find_by_name` for filbaseret søgning
- Kodeanalyse- og forståelsesmoduler

## 2. Parameter Optimering
Effektiv anvendelse af `codebase_search` afhænger af præcis parameterkonfiguration.

### 2.1 Query Parameter
Denne parameter definerer søgespørgsmålet i naturligt sprog:

#### 2.1.1 Spørgsmålstyper
- **Funktionalitetssøgning**: "Hvordan håndteres brugerautentificering?"
- **Implementeringssøgning**: "Hvor er databaseforbindelsen implementeret?"
- **Komponentsøgning**: "Find hovednavigationskomponenten"
- **Processeringsøgning**: "Hvordan behandles formularinput?"

#### 2.1.2 Optimeringsstrategier
- Anvend præcise, fokuserede spørgsmål
- Inkluder nøgleord relateret til den søgte funktionalitet
- Undgå for brede eller generelle spørgsmål
- Specificer kontekst når relevant (f.eks. "i frontend-koden")
- Anvend tekniske termer konsistent

### 2.2 TargetDirectories Parameter
Denne parameter definerer hvilke mapper der skal søges i:

#### 2.2.1 Mappestrategier
- **Hele projektet**: Søg i alle relevante mapper
- **Komponentspecifik**: Begræns til relevante moduler
- **Lagspecifik**: F.eks. kun frontend eller backend
- **Funktionalitetsspecifik**: F.eks. kun auth-relaterede mapper

#### 2.2.2 Optimeringsstrategier
- Begræns søgeomfang til relevante mapper for bedre resultater
- Undgå at inkludere binære filer, dependencies og byggefiler
- Anvend absolutte stier for præcision
- Hold antallet af filer under 500 for optimal søgekvalitet
- Prioriter dybde over bredde i søgeområder

## 3. Anvendelsesmønstre
`codebase_search` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Funktionalitetsforståelse
For at forstå hvordan en bestemt funktionalitet er implementeret:
```javascript
async function understandFeatureImplementation(feature, codebaseRoot) {
  // Definer relevante mapper baseret på funktionalitet
  const relevantDirectories = identifyRelevantDirectories(feature, codebaseRoot);
  
  // Søg efter funktionalitetens implementering
  const results = await codebase_search({
    Query: `how is ${feature} implemented`,
    TargetDirectories: relevantDirectories
  });
  
  // Analyser de mest relevante resultater
  const keyComponents = [];
  for (const result of results.slice(0, 3)) {
    console.log(`Found relevant component: ${result.file}`);
    
    // Hent detaljeret kodevisning
    const codeDetails = await view_code_item({
      File: result.file,
      NodePaths: [result.nodePath]
    });
    
    keyComponents.push({
      file: result.file,
      nodePath: result.nodePath,
      code: codeDetails,
      relevance: result.score
    });
  }
  
  // Identificer relationer mellem komponenter
  const componentRelations = analyzeComponentRelations(keyComponents);
  
  return {
    components: keyComponents,
    relations: componentRelations,
    implementationSummary: generateImplementationSummary(keyComponents)
  };
}
```

### 3.2 Arkitekturudforskning
For at forstå den overordnede arkitektur:
```javascript
async function exploreArchitecture(codebaseRoot, aspect) {
  // Definer arkitekturrelaterede søgninger
  const architectureQueries = {
    dataFlow: "how does data flow through the application",
    componentStructure: "main component hierarchy and structure",
    stateManagement: "how is application state managed",
    apiIntegration: "how are external APIs integrated"
  };
  
  // Vælg relevant søgning baseret på aspekt
  const query = architectureQueries[aspect] || architectureQueries.componentStructure;
  
  // Udfør søgning i relevante mapper
  const coreDirectories = [
    `${codebaseRoot}/src`,
    `${codebaseRoot}/lib`,
    `${codebaseRoot}/app`
  ].filter(dir => directoryExists(dir));
  
  const results = await codebase_search({
    Query: query,
    TargetDirectories: coreDirectories
  });
  
  // Byg arkitekturmodel baseret på resultater
  const architectureModel = buildArchitectureModel(results);
  
  // Identificer centrale arkitekturmønstre
  const patterns = identifyArchitecturalPatterns(architectureModel);
  
  return {
    model: architectureModel,
    patterns,
    keyComponents: results.slice(0, 5).map(r => ({ file: r.file, component: r.nodePath }))
  };
}
```

### 3.3 Kodefejlsøgning
For at identificere årsagen til en specifik fejl:
```javascript
async function troubleshootIssue(errorMessage, stackTrace, codebaseRoot) {
  // Udtræk nøgleinformation fra fejl
  const { errorType, relevantComponents } = parseErrorInformation(errorMessage, stackTrace);
  
  // Identificer relevante mapper baseret på stacktrace
  const relevantDirectories = extractDirectoriesFromStackTrace(stackTrace, codebaseRoot);
  
  // Søg efter lignende fejlmønstre
  const results = await codebase_search({
    Query: `${errorType} error handling or similar issues`,
    TargetDirectories: relevantDirectories
  });
  
  // Analyser potentielle fejlårsager
  const potentialCauses = [];
  for (const result of results) {
    const codeContext = await view_code_item({
      File: result.file,
      NodePaths: [result.nodePath]
    });
    
    const relevance = assessRelevanceToError(codeContext, errorMessage);
    if (relevance > 0.7) {
      potentialCauses.push({
        file: result.file,
        component: result.nodePath,
        relevance,
        suggestedFix: generateFixSuggestion(codeContext, errorType)
      });
    }
  }
  
  return {
    error: { type: errorType, message: errorMessage },
    potentialCauses: potentialCauses.sort((a, b) => b.relevance - a.relevance),
    recommendedActions: generateActionPlan(potentialCauses)
  };
}
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal semantisk kodesøgning.

### 4.1 Før-søgning Analyse
Før semantisk søgning:
- Analysér søgeformål og kontekst
- Formuler præcise, målrettede spørgsmål
- Identificer optimale søgeområder
- Vurdér forventet resultattype og -mængde
- Planlæg efterfølgende resultatanalyse

### 4.2 Under-søgning Analyse
Under semantisk søgning:
- Overvåg resultatrelevans og -kvalitet
- Identificer mønstre i resultater
- Vurdér behov for søgeraffinering
- Prioritér vigtige fund for videre analyse
- Opbyg mental model af kodestrukturen

### 4.3 Post-søgning Analyse
Efter semantisk søgning:
- Evaluer resultaternes fuldstændighed og relevans
- Identificer manglende information
- Planlæg opfølgende søgninger eller analyser
- Integrér fund med eksisterende forståelse
- Dokumenter centrale indsigter

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper

#### 5.1.1 Søgespørgsmålsfejl
```javascript
function analyzeQueryQuality(query) {
  const issues = [];
  
  if (!query || query.length < 5) {
    issues.push({
      type: 'too_short_query',
      message: 'Søgespørgsmålet er for kort til effektiv semantisk søgning',
      suggestion: 'Anvend længere, mere beskrivende spørgsmål'
    });
  }
  
  if (query.length > 200) {
    issues.push({
      type: 'too_long_query',
      message: 'Søgespørgsmålet er unødvendigt langt',
      suggestion: 'Fokuser spørgsmålet på de mest relevante aspekter'
    });
  }
  
  if (/^(find|search|where is|show)\s+\w+$/i.test(query)) {
    issues.push({
      type: 'too_generic_query',
      message: 'Søgespørgsmålet er for generisk',
      suggestion: 'Inkluder flere detaljer om den søgte funktionalitet'
    });
  }
  
  return issues;
}
```

#### 5.1.2 Søgeområdefejl
```javascript
function validateTargetDirectories(directories) {
  const issues = [];
  
  if (!directories || directories.length === 0) {
    issues.push({
      type: 'missing_directories',
      message: 'Ingen søgemapper specificeret',
      suggestion: 'Angiv mindst én mappe at søge i'
    });
    return issues;
  }
  
  // Tjek for eksistens og tilgængelighed
  const nonExistentDirs = directories.filter(dir => !directoryExists(dir));
  if (nonExistentDirs.length > 0) {
    issues.push({
      type: 'nonexistent_directories',
      message: `Følgende mapper eksisterer ikke: ${nonExistentDirs.join(', ')}`,
      suggestion: 'Verificér stier og anvend eksisterende mapper'
    });
  }
  
  // Tjek for for mange filer
  const totalFiles = countFilesInDirectories(directories);
  if (totalFiles > 500) {
    issues.push({
      type: 'too_many_files',
      message: `Søgeområdet indeholder ${totalFiles} filer, hvilket kan reducere søgekvaliteten`,
      suggestion: 'Begræns søgeområdet til mere specifikke mapper'
    });
  }
  
  return issues;
}
```

### 5.2 Fejlrobusthed

#### 5.2.1 Robust Semantisk Søgning
```javascript
async function robustSemanticSearch(query, directories, options = {}) {
  const { fallbackQueries = [], maxRetries = 2 } = options;
  
  // Valider og optimer søgeparametre
  const queryIssues = analyzeQueryQuality(query);
  const directoryIssues = validateTargetDirectories(directories);
  
  // Håndter kritiske problemer
  if (directoryIssues.some(issue => issue.type === 'missing_directories')) {
    throw new Error('Ingen gyldige søgemapper specificeret');
  }
  
  // Forsøg primær søgning
  try {
    return await codebase_search({
      Query: query,
      TargetDirectories: directories.filter(dir => directoryExists(dir))
    });
  } catch (error) {
    console.log(`Primær søgning fejlede: ${error.message}`);
    
    // Forsøg med alternative spørgsmål
    if (fallbackQueries.length > 0) {
      for (const fallbackQuery of fallbackQueries) {
        try {
          console.log(`Forsøger med alternativt spørgsmål: ${fallbackQuery}`);
          return await codebase_search({
            Query: fallbackQuery,
            TargetDirectories: directories.filter(dir => directoryExists(dir))
          });
        } catch (fallbackError) {
          console.log(`Alternativ søgning fejlede: ${fallbackError.message}`);
        }
      }
    }
    
    // Implementer retry-logik med optimerede parametre
    if (maxRetries > 0) {
      const optimizedQuery = optimizeQuery(query);
      const optimizedDirectories = optimizeDirectories(directories);
      
      return await robustSemanticSearch(
        optimizedQuery,
        optimizedDirectories,
        { fallbackQueries, maxRetries: maxRetries - 1 }
      );
    }
    
    throw error;
  }
}
```

### 5.3 Fejlforebyggelse
Implementér proaktive strategier:
- Formulér præcise, fokuserede søgespørgsmål
- Begræns søgeområder til relevante mapper
- Hold antallet af filer under 500 for optimal søgekvalitet
- Anvend alternative søgestrategier ved behov (f.eks. `grep_search` for mønstre)
- Kombiner semantisk søgning med andre søgeværktøjer for komplementerende resultater
- Implementer trinvis søgeraffinering baseret på initiale resultater
