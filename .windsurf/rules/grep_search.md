---
trigger: always_on
description: grep_search - Mønstersøgnings Guide
---

# grep_search Implementering
*Komplet implementeringsguide for effektiv mønstersøgning i kode*

## 1. Formål og Funktionalitet
`grep_search` er et kraftfuldt værktøj til præcis tekst- og mønstersøgning i filer og kodebaser. Dette værktøj muliggør hurtig identifikation af specifikke mønstre, symboler og tekststrenge på tværs af mange filer.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Præcis mønstersøgning med regulære udtryk
- Linje-kontekstbevidst resultatsvisning
- Filtrering baseret på filtyper og stier
- Case-sensitiv eller case-insensitiv søgning
- Effektiv håndtering af store kodebaser

Mønstersøgningen fungerer gennem:
- Effektiv tekstindeksering
- Optimeret filtraversering
- Parallel søgning hvor muligt
- Intelligent resultatfiltrering
- Kontekstbevidst resultatpræsentation

### 1.2 Integration med Windsurf
Værktøjet integrerer tæt med:
- `view_file` for visning af fundne resultater
- `view_code_item` for detaljeret analyse af matchende kode
- `find_by_name` for kombineret fil- og indholdssøgning
- `codebase_search` for komplementerende semantisk søgning

## 2. Parameter Optimering
Effektiv anvendelse af `grep_search` afhænger af præcis parameterkonfiguration.

### 2.1 Query Parameter
Denne parameter definerer søgemønsteret:

#### 2.1.1 Mønstertyper
- **Eksakt tekst**: "præcis denne tekst"
- **Regulære udtryk**: `function\s+[a-zA-Z_]+\(`
- **Symboler**: `MyClass\.myMethod`
- **Flere mønstre**: `(pattern1|pattern2)`

#### 2.1.2 Optimeringsstrategier
- Anvend specifikke mønstre for præcise resultater
- Brug regulære udtryk for komplekse mønstre
- Undgå for generelle søgetermer
- Escape specialtegn korrekt

### 2.2 SearchPath Parameter
Denne parameter definerer søgeområdet:

#### 2.2.1 Sti-strategier
- **Specifik fil**: `/path/to/file.js`
- **Mappe**: `/path/to/directory`
- **Rekursiv søgning**: Automatisk i undermapper
- **Rodsti**: Start fra projektrod

#### 2.2.2 Optimeringsstrategier
- Begræns søgning til relevante mapper
- Undgå søgning i binære filer og dependencies
- Anvend specifikke stier for hurtigere resultater
- Kombiner med Includes for filtype-filtrering

### 2.3 Andre Parametre
Yderligere parametre for finjustering:

#### 2.3.1 CaseInsensitive
- **true**: Ignorer store/små bogstaver
- **false**: Case-sensitiv søgning

#### 2.3.2 MatchPerLine
- **true**: Returner linjer med match
- **false**: Returner kun filnavne

## 3. Anvendelsesmønstre
`grep_search` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Kodesymbol Lokalisering
For at finde alle forekomster af et specifikt symbol:
```javascript
// Find alle anvendelser af en bestemt funktion
const results = await grep_search({
  Query: "calculateTotalPrice",
  SearchPath: "/src",
  CaseInsensitive: false,
  MatchPerLine: true,
  Includes: ["*.js", "*.ts"]
});

// Analyser hver forekomst
for (const match of results) {
  console.log(`${match.file}:${match.line}: ${match.lineContent}`);
  
  // Vis kontekst omkring matchet
  await view_file({
    AbsolutePath: match.file,
    StartLine: Math.max(0, match.line - 5),
    EndLine: match.line + 5
  });
}
```

### 3.2 Kodepattern Identifikation
For at identificere specifikke kodemønstre:
```javascript
// Find alle asynkrone funktioner
const asyncFunctions = await grep_search({
  Query: "async\\s+function|function\\s+\\w+\\s*\\(.*\\)\\s*{\\s*return\\s+new\\s+Promise",
  SearchPath: "/src",
  CaseInsensitive: false,
  MatchPerLine: true
});

// Kategoriser resultater
const categorized = categorizeAsyncPatterns(asyncFunctions);

// Vis eksempler på hver kategori
for (const [category, examples] of Object.entries(categorized)) {
  console.log(`${category}: ${examples.length} forekomster`);
  if (examples.length > 0) {
    await view_file({
      AbsolutePath: examples[0].file,
      StartLine: Math.max(0, examples[0].line - 2),
      EndLine: examples[0].line + 10
    });
  }
}
```

### 3.3 Sikkerhedsproblemer Søgning
For at identificere potentielle sikkerhedsproblemer:
```javascript
// Søg efter almindelige sikkerhedsrisici
const securityIssues = await grep_search({
  Query: "eval\\(|exec\\(|innerHTML|document\\.write|\\$\\(.*\\)\\.html\\(",
  SearchPath: "/src",
  CaseInsensitive: true,
  MatchPerLine: true
});

// Vurder hver potentiel sårbarhed
const vulnerabilities = [];
for (const issue of securityIssues) {
  const riskLevel = assessSecurityRisk(issue);
  if (riskLevel > 0.7) { // Høj risiko
    vulnerabilities.push({
      ...issue,
      riskLevel,
      recommendation: generateSecurityRecommendation(issue)
    });
    
    // Vis kontekst for højrisiko-problemer
    await view_file({
      AbsolutePath: issue.file,
      StartLine: Math.max(0, issue.line - 10),
      EndLine: issue.line + 10
    });
  }
}
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal mønstersøgning og -analyse.

### 4.1 Før-søgning Analyse
Før mønstersøgning:
- Analysér søgeformål og kontekst
- Optimér søgemønstre for præcision
- Identificér relevante søgeområder
- Planlæg resultatanalyse-strategi

### 4.2 Under-søgning Analyse
Under mønstersøgning:
- Overvåg resultatmængde og relevans
- Juster søgemønstre ved behov
- Filtrér irrelevante resultater
- Prioritér vigtige fund

### 4.3 Post-søgning Analyse
Efter mønstersøgning:
- Kategorisér og prioritér resultater
- Identificer mønstre på tværs af fund
- Korrelér med andre søgeresultater
- Formulér opfølgende søgninger

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper

#### 5.1.1 Søgemønsterfejl
```javascript
function validateSearchPattern(pattern) {
  try {
    // Test regulært udtryk validitet
    new RegExp(pattern);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: `Ugyldigt søgemønster: ${error.message}`,
      suggestion: suggestPatternFix(pattern, error)
    };
  }
}
```

#### 5.1.2 For Brede Søgninger
```javascript
function detectOverbroadSearch(query, searchPath) {
  const riskFactors = [];
  
  // Tjek for meget korte søgetermer
  if (query.length < 3 && !query.includes('\\')) {
    riskFactors.push('Søgeterm for kort, vil give mange resultater');
  }
  
  // Tjek for søgning i hele projektrod
  if (searchPath === '/' || searchPath === '.') {
    riskFactors.push('Søgning i hele projektet kan være ineffektivt');
  }
  
  // Tjek for meget generelle regulære udtryk
  if (/^[a-z\s]+$/i.test(query)) {
    riskFactors.push('Generelt tekstmønster uden specialtegn');
  }
  
  return riskFactors;
}
```

### 5.2 Fejlrobusthed

#### 5.2.1 Adaptiv Søgestrategi
```javascript
async function adaptiveGrepSearch(initialQuery, searchPath, maxResults = 100) {
  // Start med initial søgning
  let results = await grep_search({
    Query: initialQuery,
    SearchPath: searchPath,
    MatchPerLine: true
  });
  
  // Tilpas søgning baseret på resultatmængde
  if (results.length > maxResults) {
    // For mange resultater - prøv at specificere søgningen
    const refinedQuery = refineSearchQuery(initialQuery, results);
    results = await grep_search({
      Query: refinedQuery,
      SearchPath: searchPath,
      MatchPerLine: true
    });
  } else if (results.length === 0) {
    // Ingen resultater - prøv at gøre søgningen bredere
    const broadenedQuery = broadenSearchQuery(initialQuery);
    results = await grep_search({
      Query: broadenedQuery,
      SearchPath: searchPath,
      CaseInsensitive: true,
      MatchPerLine: true
    });
  }
  
  return results;
}
```

### 5.3 Fejlforebyggelse
Implementér proaktive strategier:
- Validér søgemønstre før eksekvering
- Begræns søgeområder til relevante mapper
- Implementer timeout for lange søgninger
- Anvend inkrementel søgning for store kodebaser
