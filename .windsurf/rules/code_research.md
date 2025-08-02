---
trigger: always_on
description: code_research - Kodeundersøgelses Guide
---

# code_research Implementering
*Komplet implementeringsguide for effektiv kodeundersøgelse og -forståelse*

## 1. Formål og Funktionalitet
`code_research` er et avanceret system til effektiv udforskning, analyse og forståelse af kodebase og kodemønstre i Windsurf-miljøet. Dette system muliggør dybdegående kodeforståelse og præcis informationsudtrækning fra komplekse kodebaser.

### 1.1 Kernefunktionalitet
Systemet tilbyder:
- Strategisk kodesøgning og -udforskning
- Kontekstbevidst kodeanalyse
- Mønstergenkendelse i kodestrukturer
- Relationel kodeforståelse
- Effektiv informationsudtrækning

Kodeundersøgelsen fungerer gennem:
- Integreret anvendelse af søgeværktøjer
- Kontekstbevidst kodevisning
- Hierarkisk kodeforståelse
- Relationel komponentanalyse
- Iterativ informationsraffinering

### 1.2 Integration med Windsurf
Systemet integrerer tæt med:
- `grep_search` for mønsterbaseret søgning
- `codebase_search` for semantisk kodesøgning
- `view_file` og `view_code_item` for kodeinspektion
- `find_by_name` for filbaseret søgning

## 2. Parameter Optimering
Effektiv kodeundersøgelse afhænger af optimal værktøjsanvendelse og søgestrategi.

### 2.1 Søgestrategier
Valg af optimal søgestrategi:

#### 2.1.1 Søgetyper
- **Eksakt tekstsøgning**: Præcise symboler eller konstanter
- **Mønsterbaseret søgning**: Regulære udtryk og mønstre
- **Semantisk søgning**: Funktionalitets- eller formålsbaseret
- **Filnavnsøgning**: Specifik filidentifikation

#### 2.1.2 Optimeringsstrategier
- Start med præcise søgninger før generelle
- Anvend semantisk søgning for funktionalitetsforståelse
- Brug mønsterbaseret søgning for implementeringsdetaljer
- Implementer iterativ søgningsraffinering

### 2.2 Kodevisningsparametre
Optimal kodevisning og -analyse:

#### 2.2.1 Visningsstrategier
- **Fuld kontekst**: 200 linjer for omfattende forståelse
- **Symbolspecifik**: Præcis visning af funktioner/klasser
- **Hierarkisk**: Navigering gennem kodestrukturer
- **Relationel**: Forståelse af komponentsammenhænge

#### 2.2.2 Optimeringsstrategier
- Maksimer kontekst ved første visning (200 linjer)
- Anvend symbolspecifik visning for detaljeret analyse
- Implementer hierarkisk navigation for komplekse strukturer
- Spor relationelle afhængigheder systematisk

## 3. Anvendelsesmønstre
`code_research` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Funktionalitetsforståelse
For at forstå specifik kodefunktionalitet:
```javascript
// Trin 1: Semantisk søgning efter funktionalitet
const semanticResults = await codebase_search({
  Query: "brugerautentificering implementering",
  TargetDirectories: ["/src"]
});

// Trin 2: Undersøg nøglekomponenter
for (const result of semanticResults.slice(0, 3)) {
  await view_code_item({
    File: result.file,
    NodePaths: [result.nodePath]
  });
}

// Trin 3: Følg afhængigheder
const dependencies = extractDependencies(semanticResults);
for (const dep of dependencies) {
  await view_file({
    AbsolutePath: dep.path,
    StartLine: dep.startLine,
    EndLine: dep.startLine + 199
  });
}
```

### 3.2 Fejlfinding og Debugging
For at identificere og løse kodeproblemer:
```javascript
// Trin 1: Søg efter fejlmønster
const errorResults = await grep_search({
  Query: "TypeError: Cannot read property",
  SearchPath: "/src",
  MatchPerLine: true
});

// Trin 2: Analysér fejlkontekst
for (const match of errorResults) {
  await view_file({
    AbsolutePath: match.file,
    StartLine: Math.max(0, match.line - 20),
    EndLine: match.line + 20
  });
}

// Trin 3: Undersøg relaterede komponenter
const relatedComponents = identifyRelatedComponents(errorResults);
for (const component of relatedComponents) {
  await view_code_item({
    File: component.file,
    NodePaths: [component.nodePath]
  });
}
```

### 3.3 Kodebase Udforskning
For systematisk udforskning af ukendt kodebase:
```javascript
// Trin 1: Identificér hovedkomponenter
const mainFiles = await find_by_name({
  SearchDirectory: "/src",
  Pattern: "index.*|main.*|app.*"
});

// Trin 2: Analysér arkitektur
for (const file of mainFiles) {
  await view_file({
    AbsolutePath: file.path,
    StartLine: 0,
    EndLine: 199
  });
}

// Trin 3: Undersøg nøglestrukturer
const keyStructures = await codebase_search({
  Query: "class|interface|type|function",
  TargetDirectories: ["/src/core"]
});

for (const structure of keyStructures.slice(0, 5)) {
  await view_code_item({
    File: structure.file,
    NodePaths: [structure.nodePath]
  });
}
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal kodeundersøgelse og -forståelse.

### 4.1 Før-undersøgelses Analyse
Før kodeundersøgelse:
- Analysér undersøgelsesformål og -kontekst
- Identificér optimale søgestrategier
- Planlæg systematisk udforskningsproces
- Prioritér nøglekomponenter for initial analyse

### 4.2 Under-undersøgelses Analyse
Under kodeundersøgelse:
- Spor relationelle afhængigheder mellem komponenter
- Opbyg mental model af kodearkitektur
- Identificér mønstre og antipatterns
- Tilpas undersøgelsesstrategi baseret på fund

### 4.3 Post-undersøgelses Analyse
Efter kodeundersøgelse:
- Konsolidér forståelse af kodebase
- Identificér manglende information
- Formulér opfølgende undersøgelsesspørgsmål
- Dokumentér nøglefund og indsigter

## 5. Fejlhåndtering

### 5.1 Almindelige Undersøgelsesfejl

#### 5.1.1 Ufuldstændig Kontekst
```javascript
function detectContextGaps(viewedCode, codebaseStructure) {
  const gaps = [];
  
  // Identificér manglende afhængigheder
  const dependencies = extractDependencies(viewedCode);
  for (const dep of dependencies) {
    if (!isInViewedCode(dep, viewedCode)) {
      gaps.push({
        type: 'missing_dependency',
        dependency: dep,
        recommendation: `Undersøg ${dep.path} for at forstå afhængigheden`
      });
    }
  }
  
  // Identificér manglende overklasser/interfaces
  const inheritanceGaps = findInheritanceGaps(viewedCode, codebaseStructure);
  gaps.push(...inheritanceGaps);
  
  return gaps;
}
```

#### 5.1.2 Ineffektive Søgestrategier
```javascript
function evaluateSearchEfficiency(searchHistory) {
  const issues = [];
  
  // Tjek for overinkluderende søgninger
  if (searchHistory.some(s => s.resultCount > 100)) {
    issues.push({
      type: 'too_broad_search',
      recommendation: 'Specificér søgninger med mere præcise termer eller begræns søgeområdet'
    });
  }
  
  // Tjek for redundante søgninger
  const redundantPatterns = findRedundantPatterns(searchHistory);
  if (redundantPatterns.length > 0) {
    issues.push({
      type: 'redundant_searches',
      patterns: redundantPatterns,
      recommendation: 'Konsolidér relaterede søgninger for bedre effektivitet'
    });
  }
  
  return issues;
}
```

### 5.2 Undersøgelsesrobusthed

#### 5.2.1 Adaptiv Undersøgelsesstrategi
```javascript
function adaptResearchStrategy(currentFindings, researchGoal) {
  // Evaluer nuværende fremskridt
  const completionRate = evaluateCompletionRate(currentFindings, researchGoal);
  
  // Juster strategi baseret på fremskridt
  if (completionRate < 0.3) {
    return {
      recommendation: 'Bredere søgning for at etablere grundlæggende forståelse',
      suggestedApproach: generateBroaderApproach(researchGoal)
    };
  } else if (completionRate < 0.7) {
    return {
      recommendation: 'Fokusér på identificerede nøglekomponenter',
      suggestedApproach: generateFocusedApproach(currentFindings)
    };
  } else {
    return {
      recommendation: 'Dybdegående analyse af specifikke detaljer',
      suggestedApproach: generateDeepDiveApproach(currentFindings, researchGoal)
    };
  }
}
```

### 5.3 Fejlforebyggelse
Implementér proaktive strategier:
- Verificér altid komplet kontekst ved kodevisning
- Implementér systematisk afhængighedssporing
- Anvend multiple søgestrategier for robust forståelse
- Dokumentér nøglefund løbende under undersøgelsen
