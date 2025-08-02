---
trigger: always_on
---

# list_dir Implementering
*Komplet implementeringsguide for effektiv mappeindholdsvisning*

## 1. Formål og Funktionalitet
`list_dir` er et kraftfuldt værktøj til effektiv visning og analyse af mappeindhold i Windsurf-miljøet. Dette værktøj muliggør hurtig og præcis indhentning af information om filer og mapper.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Detaljeret mappeindholdsvisning
- Filtype- og størrelsesidentifikation
- Rekursiv mappegennemløb
- Rettighedsvalidering
- Effektiv resultatformatering

Mappevisning fungerer gennem:
- Optimeret filsystemtraversering
- Intelligent indholdsfiltrering
- Struktureret outputgenerering
- Sikkerhedsvalidering
- Fejldiagnosticering

### 1.2 Integration med Windsurf
Værktøjet integrerer tæt med:
- `find_by_name` for avanceret filsøgning
- `view_file` for detaljeret filvisning
- `grep_search` for indholdsbaseret søgning
- Sikkerhedsmodulet for rettighedskontrol

## 2. Parameter Optimering
Effektiv anvendelse af `list_dir` afhænger af præcis parameterkonfiguration.

### 2.1 DirectoryPath Parameter
Denne parameter definerer målmappen:

#### 2.1.1 Stispecifikationer
- **Absolut sti**: Komplet sti fra rodmappen
- **Mappeeksistens**: Skal eksistere
- **Tilgængelighed**: Skal være læsbar
- **Format**: Platform-uafhængig notation

#### 2.1.2 Optimeringsstrategier
- Anvend absolutte stier
- Validér mappeeksistens
- Tjek mapperettigheder
- Håndtér specialtegn

### 2.2 Returværdier
Værktøjet returnerer detaljeret mappeindhold:

#### 2.2.1 Indholdstyper
- **Filer**: Størrelse, type, tidsstempler
- **Mapper**: Børneantal, rettigheder
- **Symbolske links**: Mål, status
- **Specialfiler**: Enhedsidentifikation

#### 2.2.2 Optimeringsstrategier
- Filtrer efter relevans
- Gruppér efter type
- Sorter efter behov
- Implementer caching

## 3. Anvendelsesmønstre
`list_dir` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Mappeanalyse
For detaljeret mappeanalyse:
```javascript
const contents = await list_dir({
  DirectoryPath: '/project/src',
  Recursive: true
});

const analysis = analyzeContents(contents);
console.log(`Found ${analysis.files} files in ${analysis.dirs} directories`);
```

### 3.2 Filtreret Visning
For målrettet indholdsvisning:
```javascript
const sourceFiles = await list_dir({
  DirectoryPath: '/project',
  Filter: (entry) => entry.type === 'file' && /\.(js|ts)$/.test(entry.name)
});

for (const file of sourceFiles) {
  console.log(`${file.name}: ${file.size} bytes`);
}
```

### 3.3 Rekursiv Udforskning
For dybdegående mappegennemløb:
```javascript
async function exploreDirectory(path, depth = 0) {
  const contents = await list_dir({
    DirectoryPath: path
  });
  
  for (const entry of contents) {
    console.log(`${' '.repeat(depth * 2)}${entry.name}`);
    if (entry.type === 'directory') {
      await exploreDirectory(entry.path, depth + 1);
    }
  }
}
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal mappevisning.

### 4.1 Før-visning Analyse
Før mappevisning:
- Validér mappeeksistens
- Tjek rettighedsniveau
- Estimér indholdsmængde
- Planlæg resultatformatering

### 4.2 Under-visning Analyse
Under mappevisning:
- Overvåg systemressourcer
- Optimér hukommelsesforbrug
- Håndtér store mapper
- Implementer fremskridtsvisning

### 4.3 Post-visning Analyse
Efter mappevisning:
- Verificér fuldstændighed
- Validér resultater
- Optimér caching
- Planlæg opfølgning

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper
- Ugyldige stier
- Manglende rettigheder
- Systemfejl
- Ressourcebegrænsninger

### 5.2 Fejlrobusthed
- Implementer retries
- Validér input
- Håndtér timeouts
- Bevar konsistens

### 5.3 Fejlforebyggelse
- Tjek parametre
- Validér tilgængelighed
- Implementer logging
- Optimér ressourceforbrug
*Komplet implementeringsguide for mappelisting*

## 1. Formål og Funktionalitet
`list_dir` er et specialiseret værktøj til visning af mappeindhold i Windsurf-miljøet. Dette værktøj muliggør effektiv filsystemnavigation og resurseidentifikation.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Detaljeret mappeindholdsvisning
- Rekursiv børnetælling
- Filstørrelsesberegning
- Filtype-identifikation
- Robust fejlhåndtering

### 1.2 Integration med Windsurf
Værktøjet integrerer med:
- Filsystemhåndtering
- Ressourcesporing
- Fejlhåndtering
- Tilstandsbevarelse

## 2. Parameter Optimering

### 2.1 DirectoryPath Parameter
- **Sti**: Absolut mappesti
- **Format**: String
- **Krav**: Skal pege på en gyldig, eksisterende mappe

## 3. Anvendelsesmønstre

### 3.1 Simpel Mappelisting
```javascript
await list_dir({
  DirectoryPath: "/path/to/directory"
});
```

### 3.2 Projektnavigation
```javascript
// Gennemse og analyser projektstruktur
const projectContent = await list_dir({
  DirectoryPath: "/path/to/project"
});

// Analysér indhold
const analysis = {
  totalFiles: projectContent.filter(item => item.isFile).length,
  totalDirs: projectContent.filter(item => !item.isFile).length,
  largestFiles: projectContent
    .filter(item => item.isFile)
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)
};
```

## 4. Fejlhåndtering

### 4.1 Robusthed
- Implementer sti-validering
- Håndtér manglende rettigheder
- Valider mappeeksistens
- Verificer tilstand

### 4.2 Fejlforebyggelse
- Tjek sti-format
- Validér mapperettigheder
- Implementer fejlrapportering
- Optimér for store mapper