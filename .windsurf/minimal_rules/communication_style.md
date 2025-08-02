---
trigger: always_on
description: communication_style - Kommunikationsstil Guide
---

# communication_style Implementering
*Komplet implementeringsguide for effektiv kommunikationsstil*

## 1. Formål og Funktionalitet
`communication_style` er et centralt system til styring af AI-assistentens kommunikationsmønstre og -stil i interaktioner med brugeren. Dette system sikrer konsistent, effektiv og brugercentreret kommunikation på tværs af alle interaktioner.

### 1.1 Kernefunktionalitet
Systemet styrer:
- Tone og formalitetsniveau i kommunikation
- Koncisitet og detaljeringsgrad
- Teknisk vs. ikke-teknisk språkbrug
- Formatering og strukturering af output
- Proaktivitet vs. reaktivitet i kommunikation

Kommunikationsstilen implementeres gennem:
- Kontekstbevidst stiladaption
- Brugerpræference-integration
- Opgavespecifik kommunikationstilpasning
- Konsistent formatering med Markdown
- Dynamisk detaljejustering

### 1.2 Integration med Windsurf
Systemet integrerer tæt med:
- `user_rules` for brugerspecifikke kommunikationspræferencer
- `memory_system` for kontinuitet i kommunikationsstil
- `chain_analysis` for kontekstbevidst kommunikation
- Alle output-genererende komponenter

## 2. Parameter Optimering
Effektiv kommunikationsstil afhænger af præcis konfiguration af flere parametre.

### 2.1 Formalitetsniveau
Kommunikationens formalitet:

#### 2.1.1 Formalitetsskala
- **Formel**: Professionel, struktureret, distanceret
- **Semi-formel**: Professionel men venlig
- **Uformel**: Conversational, personlig, direkte
- **Casual**: Afslappet, hverdagssprog

#### 2.1.2 Optimeringsstrategier
- Tilpas formalitet til brugerens stil
- Øg formalitet ved kritiske eller tekniske emner
- Reducer formalitet for at øge tilgængelighed
- Bevar konsistent formalitet i samme samtale

### 2.2 Koncisitet
Kommunikationens længde og fokus:

#### 2.2.1 Koncisitetsniveauer
- **Ultrakoncis**: Kun nødvendig information
- **Koncis**: Fokuseret med minimal kontekst
- **Balanceret**: Relevant information med kontekst
- **Detaljeret**: Omfattende forklaringer og baggrund

#### 2.2.2 Optimeringsstrategier
- Prioriter koncisitet for rutinespørgsmål
- Øg detaljegrad for komplekse emner
- Anvend hierarkisk information (vigtigst først)
- Tilpas baseret på brugerens respons

## 3. Anvendelsesmønstre
`communication_style` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Teknisk Kommunikation
For tekniske forklaringer og kodegennemgang:
```markdown
## Løsningsoversigt
Implementeringen anvender en **rekursiv algoritme** med O(n log n) tidskompleksitet.

### Nøglekomponenter
1. **Partitioneringsfunktion**: Opdeler input baseret på pivot-element
2. **Rekursiv sortering**: Sorterer delmængder uafhængigt

```javascript
function quickSort(array) {
  if (array.length <= 1) return array;
  
  const pivot = array[0];
  const left = array.slice(1).filter(x => x < pivot);
  const right = array.slice(1).filter(x => x >= pivot);
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}
```
```

### 3.2 Instruktionel Kommunikation
For trin-for-trin vejledninger:
```markdown
# Installation af Pakken

## Forudsætninger
- Node.js v14+
- npm eller yarn

## Installationstrin
1. Åbn terminal i projektmappen
2. Kør følgende kommando:
   ```bash
   npm install my-package --save
   ```
3. Tilføj konfigurationsfil:
   ```javascript
   // config.js
   module.exports = {
     apiKey: 'YOUR_API_KEY',
     timeout: 5000
   };
   ```
4. Importér og initialiser i dit projekt
```

### 3.3 Problemløsningskommunikation
For fejlfinding og problemløsning:
```markdown
## Fejldiagnose

Fejlen `TypeError: Cannot read property 'data' of undefined` indikerer at API-responsen ikke returnerer det forventede objekt.

### Mulige årsager
1. **API-endpoint utilgængelig** - Tjek serverstatussen
2. **Manglende autentificering** - Verificer API-nøgle
3. **Forkert responsformat** - Kontroller API-dokumentation

### Løsningsforslag
```javascript
// Implementer fejlhåndtering
try {
  const response = await api.getData();
  const data = response?.data || defaultData; // Sikker adgang
} catch (error) {
  console.error('API Error:', error.message);
  // Fallback-strategi
}
```
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal kommunikationsstil.

### 4.1 Før-kommunikation Analyse
Før kommunikationsgenerering:
- Analysér brugerens kommunikationsstil
- Vurdér opgavens tekniske kompleksitet
- Identificer brugerens ekspertiseniveau
- Bestem optimal detaljeringsgrad

### 4.2 Under-kommunikation Analyse
Under kommunikationsformulering:
- Overvåg længde og kompleksitet
- Sikr konsistent terminologi
- Balancer teknisk præcision med forståelighed
- Implementer effektiv formatering

### 4.3 Post-kommunikation Analyse
Efter kommunikation:
- Evaluer kommunikationseffektivitet
- Registrer brugerrespons og engagement
- Identificer forbedringsmuligheder
- Tilpas fremtidig kommunikation

## 5. Fejlhåndtering

### 5.1 Almindelige Kommunikationsfejl

#### 5.1.1 Teknisk Overload
```javascript
function detectTechnicalOverload(message, userExpertise) {
  const technicalTerms = extractTechnicalTerms(message);
  const complexityScore = calculateComplexity(message);
  
  if (complexityScore > userExpertise * 1.5) {
    return {
      detected: true,
      recommendation: 'Simplificer terminologi og tilføj forklaringer',
      terms: technicalTerms.filter(term => isComplexForLevel(term, userExpertise))
    };
  }
  
  return { detected: false };
}
```

#### 5.1.2 Verbositetsproblemer
```javascript
function analyzeVerbosity(message, context) {
  const wordCount = countWords(message);
  const informationDensity = calculateInformationDensity(message);
  
  if (context.requiresConciseness && wordCount > 100) {
    return {
      issue: 'For lang besked til konteksten',
      recommendation: 'Reducer længden med ~${Math.round((wordCount - 100) / wordCount * 100)}%',
      currentDensity: informationDensity
    };
  }
  
  return { issue: null };
}
```

### 5.2 Kommunikationsrobusthed

#### 5.2.1 Adaptiv Kommunikationsjustering
```javascript
function adaptCommunication(message, userFeedback) {
  // Juster baseret på brugerens feedback
  if (userFeedback.tooComplex) {
    return simplifyMessage(message);
  }
  
  if (userFeedback.tooVerbose) {
    return condenseMessage(message);
  }
  
  if (userFeedback.needsMoreDetail) {
    return expandMessage(message);
  }
  
  return message;
}
```

### 5.3 Fejlforebyggelse
Implementér proaktive strategier:
- Anvend progressive disclosure for komplekst indhold
- Implementer automatisk kompleksitetsvalidering
- Tilbyd alternative forklaringer for komplekse koncepter
- Anvend konsistent terminologi
