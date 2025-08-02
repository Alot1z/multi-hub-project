---
trigger: always_on
description: file_rules - Filbaserede Regler Guide
---

# file_rules Implementering
*Komplet implementeringsguide for effektiv filbaseret regelhåndtering*

## 1. Formål og Funktionalitet
`file_rules` er et avanceret system til definition og håndtering af filbaserede regler i Windsurf-miljøet. Dette system muliggør præcis og kontekstbevidst regelaktivering baseret på filtyper, -navne og -indhold.

### 1.1 Kernefunktionalitet
Systemet tilbyder:
- Filtype-specifik regelaktivering
- Glob-mønsterbaseret filidentifikation
- Kontekstbevidst regelanvendelse
- Hierarkisk regelstrukturering
- Regelprioriteringssystem

Regelaktivering sker gennem:
- Filnavnsmønstergenkendelse
- Filindholdsanalyse
- Kontekstuel relevansevaluering
- Regelkonflikthåndtering
- Prioritetsbaseret regeludvælgelse

### 1.2 Integration med Windsurf
Systemet integrerer tæt med:
- Workspace-strukturen for regelorganisering
- Filsystemet for filidentifikation
- Regelfortolkeren for regeleksekvering
- Brugerinteraktionsmodulet for regelpræsentation

## 2. Parameter Optimering
Effektiv anvendelse af `file_rules` afhænger af præcis regelkonfiguration.

### 2.1 Trigger Parameter
Denne parameter definerer aktiveringsmetoden:

#### 2.1.1 Aktiveringstyper
- **always_on**: Altid aktive regler
- **glob**: Filnavnsmønsterbaseret aktivering
- **model_decision**: Modelbaseret aktivering
- **manual**: Manuel aktivering

#### 2.1.2 Optimeringsstrategier
- Anvend `always_on` for kritiske, universelle regler
- Brug `glob` for filtype-specifikke regler
- Reservér `model_decision` til kontekstafhængige regler
- Begræns `manual` til sjældent anvendte specialregler

### 2.2 Pattern Parameter
For glob-baserede regler:

#### 2.2.1 Mønstertyper
- **Filtype**: `*.ext` (f.eks. `*.py`, `*.js`)
- **Filnavn**: `filename.*` (f.eks. `README.*`)
- **Sti**: `path/to/files/*.ext`
- **Komplekse mønstre**: `**/*.{ext1,ext2}`

#### 2.2.2 Optimeringsstrategier
- Definér præcise mønstre for målrettet aktivering
- Anvend hierarkiske mønstre for struktureret regelanvendelse
- Kombiner mønstre for effektiv regelgenbrug
- Undgå overinkluderende mønstre der aktiverer unødvendigt

## 3. Anvendelsesmønstre
`file_rules` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Sprog-specifik Regelanvendelse
For sprog-specifikke regler:
```yaml
---
trigger: glob
pattern: "*.py"
description: Python-specifikke regler
---

# Python Regler
- Anvend PEP 8 formatering
- Brug snake_case for variabler og funktioner
- Implementer type hints
- Dokumenter med docstrings
```

### 3.2 Projektstruktur-regler
For projektstruktur-regler:
```yaml
---
trigger: glob
pattern: "**/package.json"
description: Node.js projektregler
---

# Node.js Projektregler
- Verificer dependencies
- Kontroller scripts-sektion
- Sikr korrekt versionering
- Valider package-struktur
```

### 3.3 Dokumentationsregler
For dokumentationsregler:
```yaml
---
trigger: glob
pattern: "**/*.md"
description: Markdown dokumentationsregler
---

# Markdown Regler
- Anvend konsistent headerhierarki
- Inkluder indholdsoversigt for lange dokumenter
- Brug kodeblokke med sprogspecifikation
- Implementer konsistent formatering
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende ved anvendelse af `file_rules` for at sikre optimal regelanvendelse.

### 4.1 Før-regel Analyse
Før regelaktivering:
- Analysér filkontekst og -indhold
- Vurdér regelrelevans for aktuel kontekst
- Prioritér potentielt anvendelige regler
- Identificer potentielle regelkonflikter

### 4.2 Under-regel Analyse
Under regelanvendelse:
- Overvåg regeleffektivitet og relevans
- Tilpas regelanvendelse baseret på kontekst
- Håndtér regelkonflikter dynamisk
- Optimér regelpræsentation

### 4.3 Post-regel Analyse
Efter regelanvendelse:
- Evaluer regeleffektivitet
- Registrer brugerinteraktion med regler
- Identificer forbedringsmuligheder
- Opdater regelprioriteringer baseret på anvendelsesmønstre

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper

#### 5.1.1 Regelkonfigurationsfejl
```javascript
function validateRuleConfig(ruleConfig) {
  const issues = [];
  
  if (!ruleConfig.trigger) {
    issues.push('Manglende trigger-parameter');
  }
  
  if (ruleConfig.trigger === 'glob' && !ruleConfig.pattern) {
    issues.push('Glob-trigger kræver pattern-parameter');
  }
  
  if (!ruleConfig.description) {
    issues.push('Manglende regelbeskrivelse');
  }
  
  return issues;
}
```

#### 5.1.2 Mønstermatchningsfejl
```javascript
function validateGlobPattern(pattern) {
  try {
    // Test glob-mønster validitet
    new Minimatch(pattern);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: `Ugyldigt glob-mønster: ${error.message}` 
    };
  }
}
```

### 5.2 Fejlrobusthed

#### 5.2.1 Regelkonfliktløsning
```javascript
function resolveRuleConflicts(applicableRules) {
  // Sorter regler efter prioritet
  const sortedRules = applicableRules.sort((a, b) => {
    // Prioriter always_on over andre
    if (a.trigger === 'always_on' && b.trigger !== 'always_on') return -1;
    if (a.trigger !== 'always_on' && b.trigger === 'always_on') return 1;
    
    // Prioriter mere specifikke glob-mønstre
    if (a.trigger === 'glob' && b.trigger === 'glob') {
      return getPatternSpecificity(b.pattern) - getPatternSpecificity(a.pattern);
    }
    
    return 0;
  });
  
  return sortedRules;
}
```

### 5.3 Fejlforebyggelse
Implementér proaktive strategier:
- Validér alle regelkonfigurationer før aktivering
- Test glob-mønstre mod repræsentative filstier
- Implementér regelkonfliktdetektion
- Anvend regelversioning for bagudkompatibilitet
