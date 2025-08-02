---
trigger: always_on
description: find_by_name - Implementeringsguide
---

# find_by_name Implementering
*Komplet implementeringsguide for effektiv filsøgning*

## 1. Formål og Funktionalitet
`find_by_name` er et kraftfuldt værktøj til søgning efter filer og mapper baseret på navne og mønstre i Windsurf-miljøet. Dette værktøj muliggør hurtig identifikation af filer og mapper på tværs af komplekse mappestrukturer med avancerede filtreringsmuligheder.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Søgning efter filer og mapper baseret på navnemønstre
- Rekursiv udforskning af mappestrukturer
- Avanceret filtrering med inkluderings- og ekskluderingsmønstre
- Dybdebegrænsning for præcis søgning
- Detaljeret resultatvisning med filattributter

Filsøgningen fungerer gennem:
- Effektiv filsystemtraversering
- Glob-mønstergenkendelse
- Intelligent filtreringslogik
- Optimeret resultatindsamling
- Struktureret resultatpræsentation

### 1.2 Integration med Windsurf
Værktøjet integrerer tæt med:
- `view_file` for visning af fundne filer
- `grep_search` for kombineret fil- og indholdssøgning
- `codebase_search` for semantisk søgning i fundne filer
- Filsystemsværktøjer for efterfølgende filoperationer

## 2. Parameter Optimering
Effektiv anvendelse af `find_by_name` afhænger af præcis parameterkonfiguration.

### 2.1 SearchDirectory Parameter
Denne parameter definerer rodmappen for søgningen:

#### 2.1.1 Sti-strategier
- **Projektrod**: Søg i hele projektet fra roden
- **Specifik undermappe**: Begræns søgning til relevant kontekst
- **Absolut sti**: Præcis angivelse af søgeområde
- **Relativ sti**: Kontekstafhængig søgning

#### 2.1.2 Optimeringsstrategier
- Anvend så specifik en søgesti som muligt for bedre performance
- Undgå søgning i store binære mapper og dependencies
- Verificér stiens eksistens før søgning
- Anvend platformuafhængige stiformater

### 2.2 Pattern Parameter
Denne parameter definerer søgemønsteret i glob-format:

#### 2.2.1 Mønstertyper
- **Eksakt navn**: `filename.ext`
- **Filtype**: `*.ext` (f.eks. `*.js`, `*.py`)
- **Navnepræfiks**: `prefix*` (f.eks. `test_*`)
- **Navnesuffiks**: `*suffix` (f.eks. `*_test`)
- **Komplekse mønstre**: `**/*.{js,ts}` (rekursivt, flere filtyper)

#### 2.2.2 Optimeringsstrategier
- Anvend specifikke mønstre for præcise resultater
- Brug `**` for rekursiv søgning i undermapper
- Kombiner flere filtyper med `{ext1,ext2}` syntaks
- Escape specialtegn korrekt i mønstre

### 2.3 Extensions Parameter
Denne parameter definerer filtyper der skal inkluderes:

#### 2.3.1 Anvendelse
- **Enkelt filtype**: `["js"]`
- **Flere filtyper**: `["js", "ts", "jsx"]`
- **Dokumenttyper**: `["md", "txt", "pdf"]`
- **Konfigurationsfiler**: `["json", "yaml", "toml"]`

#### 2.3.2 Optimeringsstrategier
- Angiv filtyper uden punktum (`.`)
- Prioritér relevante filtyper for konteksten
- Kombiner med Pattern for avanceret filtrering
- Anvend konsistente filtyper på tværs af søgninger

### 2.4 Andre Parametre
Yderligere parametre for finjustering:

#### 2.4.1 MaxDepth
- **Ubegrænset**: Ingen dybdebegrænsning
- **Overfladisk**: 1-2 niveauer for hurtig søgning
- **Moderat**: 3-5 niveauer for balanceret søgning
- **Dyb**: >5 niveauer for grundig søgning

#### 2.4.2 Type
- **file**: Kun filer
- **directory**: Kun mapper
- **any**: Både filer og mapper

#### 2.4.3 Excludes
- **Binære mapper**: `["node_modules", "dist", "build"]`
- **Midlertidige filer**: `["*.tmp", "*.log"]`
- **Systemfiler**: `[".git", ".vscode"]`

## 3. Anvendelsesmønstre
`find_by_name` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Projektstrukturudforskning
For at udforske og forstå en projektstruktur:
```javascript
async function exploreProjectStructure(projectRoot) {
  // Find alle mapper i projektet
  const directories = await find_by_name({
    SearchDirectory: projectRoot,
    Type: "directory",
    MaxDepth: 2,
    Excludes: ["node_modules", ".git"]
  });
  
  // Kategoriser mapper efter type
  const structure = {
    source: directories.filter(dir => /src|lib|app/.test(dir.path)),
    tests: directories.filter(dir => /test|spec|__tests__/.test(dir.path)),
    config: directories.filter(dir => /config|settings/.test(dir.path)),
    docs: directories.filter(dir => /docs|documentation/.test(dir.path)),
    other: directories.filter(dir => !/src|lib|app|test|spec|__tests__|config|settings|docs|documentation/.test(dir.path))
  };
  
  // Analyser hver kategori for at forstå projektstrukturen
  for (const [category, dirs] of Object.entries(structure)) {
    console.log(`${category}: ${dirs.length} directories`);
    for (const dir of dirs.slice(0, 3)) { // Vis de første 3 i hver kategori
      const files = await find_by_name({
        SearchDirectory: dir.path,
        Type: "file",
        MaxDepth: 1
      });
      console.log(`  ${dir.path}: ${files.length} files`);
    }
  }
  
  return structure;
}
```

### 3.2 Filtypenbaseret Søgning
For at finde alle filer af en bestemt type:
```javascript
async function findAllSourceFiles(projectRoot, languages = ["js", "ts", "jsx", "tsx"]) {
  // Find alle kildekodefiler
  const sourceFiles = await find_by_name({
    SearchDirectory: projectRoot,
    Extensions: languages,
    Excludes: ["node_modules", "dist", "build", ".git"],
    Type: "file"
  });
  
  // Grupper filer efter filtype
  const filesByType = {};
  for (const ext of languages) {
    filesByType[ext] = sourceFiles.filter(file => file.path.endsWith(`.${ext}`));
  }
  
  // Generer statistik
  const stats = {
    totalFiles: sourceFiles.length,
    filesByType: Object.entries(filesByType).map(([type, files]) => ({
      type,
      count: files.length,
      percentage: (files.length / sourceFiles.length * 100).toFixed(1) + '%'
    })),
    largestFiles: [...sourceFiles].sort((a, b) => b.size - a.size).slice(0, 5),
    recentlyModified: [...sourceFiles].sort((a, b) => b.modTime - a.modTime).slice(0, 5)
  };
  
  return {
    files: sourceFiles,
    stats
  };
}
```

### 3.3 Mønsterbaseret Søgning
For at finde filer baseret på navnemønstre:
```javascript
async function findPatternMatches(projectRoot, patterns, options = {}) {
  const { excludeDirs = ["node_modules", ".git"], maxDepth = null } = options;
  const allMatches = {};
  
  for (const [patternName, pattern] of Object.entries(patterns)) {
    // Søg efter hvert mønster
    const matches = await find_by_name({
      SearchDirectory: projectRoot,
      Pattern: pattern,
      Excludes: excludeDirs,
      MaxDepth: maxDepth,
      Type: "file"
    });
    
    allMatches[patternName] = matches;
    
    console.log(`Pattern "${patternName}" (${pattern}): ${matches.length} matches`);
    if (matches.length > 0) {
      console.log(`  Examples: ${matches.slice(0, 3).map(m => m.path).join(", ")}`);
    }
  }
  
  return allMatches;
}

// Eksempel på anvendelse
const patterns = {
  "React Components": "**/*Component.{js,jsx,tsx}",
  "Unit Tests": "**/*.{spec,test}.{js,ts}",
  "Configuration Files": "**/*.config.{js,json}",
  "Documentation": "**/*.{md,mdx}"
};

const matches = await findPatternMatches("/path/to/project", patterns);
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal filsøgning og -analyse.

### 4.1 Før-søgning Analyse
Før filsøgning:
- Vurdér søgeformål og kontekst
- Identificer optimale søgemønstre og -parametre
- Estimér søgeomfang og -dybde
- Planlæg efterfølgende analyse af resultater

### 4.2 Under-søgning Analyse
Under filsøgning:
- Overvåg resultatmængde og -relevans
- Identificer mønstre i fundne filer
- Tilpas søgeparametre baseret på delresultater
- Prioritér vigtige fund for videre analyse

### 4.3 Post-søgning Analyse
Efter filsøgning:
- Kategorisér og prioritér resultater
- Identificer mønstre og strukturer i fundne filer
- Planlæg opfølgende søgninger eller analyser
- Integrér resultater med andre værktøjer (f.eks. `grep_search`, `view_file`)

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper

#### 5.1.1 Søgestifejl
```javascript
function validateSearchDirectory(directory) {
  const issues = [];
  
  if (!directory) {
    issues.push({
      type: 'missing_directory',
      message: 'Søgesti mangler',
      suggestion: 'Angiv en gyldig søgesti'
    });
  }
  
  if (typeof directory !== 'string') {
    issues.push({
      type: 'invalid_directory_type',
      message: 'Søgesti skal være en streng',
      suggestion: 'Konverter sti til streng eller angiv korrekt sti-format'
    });
  }
  
  // Tjek for eksistens (asynkron operation, skal håndteres separat)
  
  return issues;
}
```

#### 5.1.2 Mønsterfejl
```javascript
function validatePattern(pattern) {
  const issues = [];
  
  if (pattern && typeof pattern !== 'string') {
    issues.push({
      type: 'invalid_pattern_type',
      message: 'Søgemønster skal være en streng',
      suggestion: 'Angiv mønster som streng i glob-format'
    });
  }
  
  if (pattern && pattern.includes('..')) {
    issues.push({
      type: 'potential_path_traversal',
      message: 'Søgemønster indeholder potentiel sti-traversering',
      suggestion: 'Undgå ".." i søgemønstre'
    });
  }
  
  try {
    // Test glob-mønster validitet (pseudokode)
    validateGlobPattern(pattern);
  } catch (error) {
    issues.push({
      type: 'invalid_glob_syntax',
      message: `Ugyldig glob-syntaks: ${error.message}`,
      suggestion: 'Korriger glob-syntaksen i henhold til dokumentationen'
    });
  }
  
  return issues;
}
```

### 5.2 Fejlrobusthed

#### 5.2.1 Robust Filsøgning
```javascript
async function robustFileFinder(searchConfig, options = {}) {
  const { fallbackPatterns = [], maxRetries = 3, retryDelay = 1000 } = options;
  
  try {
    // Forsøg primær søgning
    return await find_by_name(searchConfig);
  } catch (error) {
    console.log(`Primær søgning fejlede: ${error.message}`);
    
    // Forsøg med alternative mønstre
    if (fallbackPatterns.length > 0) {
      for (const pattern of fallbackPatterns) {
        try {
          console.log(`Forsøger med alternativt mønster: ${pattern}`);
          return await find_by_name({
            ...searchConfig,
            Pattern: pattern
          });
        } catch (fallbackError) {
          console.log(`Alternativ søgning fejlede: ${fallbackError.message}`);
        }
      }
    }
    
    // Implementer retry-logik
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Søgningsforsøg ${attempt} af ${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return await find_by_name(searchConfig);
      } catch (retryError) {
        if (attempt === maxRetries) throw retryError;
      }
    }
    
    throw error;
  }
}
```

### 5.3 Fejlforebyggelse
Implementér proaktive strategier:
- Validér altid søgesti og -mønstre før søgning
- Begræns søgedybde for store projekter
- Ekskluder store binære mapper og dependencies
- Anvend specifikke søgemønstre for præcise resultater
- Implementer timeout-håndtering for lange søgninger
- Håndtér store resultatmængder gennem filtrering og begrænsning
