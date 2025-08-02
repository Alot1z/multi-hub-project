---
trigger: always_on
description: command_status - Implementeringsguide
---

# command_status Implementering
*Komplet implementeringsguide for effektiv kommandostatusovervågning*

## 1. Formål og Funktionalitet
`command_status` er et specialiseret værktøj til overvågning og håndtering af status for tidligere eksekverede kommandoer i Windsurf-miljøet. Dette værktøj muliggør effektiv sporing af baggrundskørende processer og indhentning af deres output og fejlmeddelelser.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Statustjek af kørende kommandoer via deres ID
- Indhentning af kommandooutput med prioritetsfiltrering
- Fejlrapportering og -diagnosticering
- Ventefunktionalitet for kommandofærdiggørelse
- Effektiv håndtering af asynkrone processer

Kommandostatusovervågning fungerer gennem:
- ID-baseret kommandosporing
- Intelligent output-buffering
- Statusklassificering (kørende, færdig, fejlet)
- Prioritetsbaseret outputfiltrering
- Ventetids-optimering

### 1.2 Integration med Windsurf
Værktøjet integrerer tæt med:
- `run_command` for asynkron kommandoeksekvering
- `browser_preview` for webserver-statusovervågning
- Fejlhåndteringsmodulet for fejldiagnosticering
- Brugerinteraktionsmodulet for statusopdateringer

## 2. Parameter Optimering
Effektiv anvendelse af `command_status` afhænger af præcis parameterkonfiguration.

### 2.1 CommandId Parameter
Denne parameter definerer ID'et for den kommando, hvis status skal tjekkes:

#### 2.1.1 ID-kilder
- **Direkte fra `run_command`**: Returneret i responsens `commandId` felt
- **Fra tidligere gemte referencer**: Lagret fra tidligere operationer
- **Kun baggrunds-kommando-ID'er**: Kun gyldigt for baggrundskørende kommandoer

#### 2.1.2 Optimeringsstrategier
- Gem altid kommando-ID når der startes baggrundskørende processer
- Implementer robust fejlhåndtering for ugyldige ID'er
- Anvend ID-validering før statustjek for at undgå unødvendige kald
- Implementer timeout-håndtering for længerevarende statustjek

### 2.2 OutputCharacterCount Parameter
Denne parameter definerer antallet af tegn der skal returneres fra kommandooutput:

#### 2.2.1 Optimale værdier
- **Minimal værdi**: Så lille som muligt for at undgå overbelastning
- **Typiske værdier**: 1000-5000 tegn for standard output
- **Specifikke værdier**: Tilpasset til forventet outputmængde

#### 2.2.2 Optimeringsstrategier
- Anvend små værdier for hyppige statustjek
- Øg værdien for afsluttende statustjek
- Balancer mellem informationsbehov og hukommelsesforbrug
- Implementer inkrementel outputindhentning for store outputmængder

### 2.3 WaitDurationSeconds Parameter
Denne parameter definerer ventetiden før statustjek:

#### 2.3.1 Optimale værdier
- **0 sekunder**: Øjeblikkelig statustjek uden ventetid
- **Korte ventetider**: 1-5 sekunder for hurtige kommandoer
- **Medium ventetider**: 5-30 sekunder for standard operationer
- **Lange ventetider**: 30-60 sekunder for komplekse operationer

#### 2.3.2 Optimeringsstrategier
- Anvend 0 for øjeblikkelige statustjek uden ventetid
- Brug 60 for at vente på kommandofærdiggørelse
- Tilpas ventetid baseret på forventet kommandovarighed
- Implementer progressive ventetider for længerevarende processer

## 3. Anvendelsesmønstre
`command_status` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Simpel Statusovervågning
For grundlæggende statustjek af en baggrundskørende kommando:
```javascript
async function checkCommandCompletion(commandId) {
  try {
    // Tjek status uden ventetid
    const status = await command_status({
      CommandId: commandId,
      OutputCharacterCount: 1000,
      WaitDurationSeconds: 0
    });
    
    if (status.status === 'done') {
      return {
        completed: true,
        exitCode: status.exitCode,
        output: status.output
      };
    } else {
      return {
        completed: false,
        status: status.status
      };
    }
  } catch (error) {
    return {
      completed: false,
      error: error.message
    };
  }
}
```

### 3.2 Vent-på-færdiggørelse Mønster
For at vente på at en kommando bliver færdig:
```javascript
async function waitForCompletion(commandId, options = {}) {
  const { timeout = 300, pollInterval = 5 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout * 1000) {
    // Tjek status med ventetid
    const status = await command_status({
      CommandId: commandId,
      OutputCharacterCount: 2000,
      WaitDurationSeconds: pollInterval
    });
    
    // Kommando afsluttet
    if (status.status === 'done') {
      return {
        completed: true,
        success: status.exitCode === 0,
        exitCode: status.exitCode,
        output: status.output,
        elapsedTime: (Date.now() - startTime) / 1000
      };
    }
    
    // Tjek for timeout
    if (Date.now() - startTime >= timeout * 1000) {
      return {
        completed: false,
        reason: 'timeout',
        partialOutput: status.output
      };
    }
  }
}
```

### 3.3 Progressiv Outputindhentning
For at håndtere store outputmængder inkrementelt:
```javascript
async function collectCompleteOutput(commandId) {
  let allOutput = '';
  let lastOutputLength = 0;
  let isComplete = false;
  
  while (!isComplete) {
    // Tjek status med kort ventetid
    const status = await command_status({
      CommandId: commandId,
      OutputCharacterCount: 10000,
      WaitDurationSeconds: 2
    });
    
    // Kommando afsluttet
    if (status.status === 'done') {
      isComplete = true;
    }
    
    // Behandl nyt output
    if (status.output && status.output.length > lastOutputLength) {
      const newOutput = status.output.substring(lastOutputLength);
      allOutput += newOutput;
      lastOutputLength = status.output.length;
      
      // Behandl det nye output
      processOutputChunk(newOutput);
    }
    
    // Kort pause for at undgå overbelastning
    if (!isComplete) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return allOutput;
}
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal statusovervågning og -håndtering.

### 4.1 Før-statustjek Analyse
Før statustjek:
- Vurdér optimal ventetid baseret på kommandotype
- Estimér forventet outputmængde for optimal tegnantal
- Planlæg statustjekfrekvens baseret på kommandoens forventede varighed
- Forbered output-behandlingsstrategi

### 4.2 Under-statustjek Analyse
Under statustjek:
- Analysér delvist output for tidlig statusbestemmelse
- Identificer mønstre der indikerer fremskridt eller problemer
- Tilpas efterfølgende statustjek baseret på aktuel status
- Implementer adaptiv ventetidsjustering

### 4.3 Post-statustjek Analyse
Efter statustjek:
- Evaluer kommandostatus og resultat
- Analysér output for mønstre, advarsler eller fejl
- Bestem næste handling baseret på status
- Dokumentér indsigter til fremtidig reference

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper

#### 5.1.1 Kommando-ID Fejl
```javascript
function validateCommandId(commandId) {
  const issues = [];
  
  if (!commandId) {
    issues.push({
      type: 'missing_id',
      message: 'Kommando-ID mangler',
      suggestion: 'Angiv et gyldigt kommando-ID fra en tidligere run_command operation'
    });
  }
  
  if (typeof commandId !== 'string') {
    issues.push({
      type: 'invalid_id_type',
      message: 'Kommando-ID skal være en streng',
      suggestion: 'Konverter ID til streng eller angiv korrekt ID-format'
    });
  }
  
  if (commandId && !commandId.match(/^[a-zA-Z0-9_\-]+$/)) {
    issues.push({
      type: 'invalid_id_format',
      message: 'Kommando-ID indeholder ugyldige tegn',
      suggestion: 'Anvend kun alfanumeriske tegn, bindestreg og underscore i ID'
    });
  }
  
  return issues;
}
```

#### 5.1.2 Timeout-håndtering
```javascript
async function executeWithTimeout(commandId, maxWaitTime) {
  // Opret timeout-promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('status_check_timeout')), maxWaitTime * 1000);
  });
  
  // Opret status-tjek promise
  const statusPromise = command_status({
    CommandId: commandId,
    OutputCharacterCount: 1000,
    WaitDurationSeconds: maxWaitTime
  });
  
  try {
    // Race mellem status-tjek og timeout
    return await Promise.race([statusPromise, timeoutPromise]);
  } catch (error) {
    if (error.message === 'status_check_timeout') {
      return {
        status: 'timeout',
        message: `Status-tjek timeout efter ${maxWaitTime} sekunder`
      };
    }
    throw error;
  }
}
```

### 5.2 Fejlrobusthed

#### 5.2.1 Robust Statustjek
```javascript
async function robustStatusCheck(commandId, options = {}) {
  const { maxRetries = 3, retryDelay = 1000, outputSize = 1000 } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await command_status({
        CommandId: commandId,
        OutputCharacterCount: outputSize,
        WaitDurationSeconds: 0
      });
    } catch (error) {
      // Vurdér om fejlen er midlertidig og kan forsøges igen
      if (isRetryableError(error) && attempt < maxRetries) {
        console.log(`Status-tjek forsøg ${attempt} fejlede, prøver igen om ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      throw error;
    }
  }
}
```

### 5.3 Fejlforebyggelse
Implementér proaktive strategier:
- Validér altid kommando-ID før statustjek
- Anvend progressive statustjek med stigende ventetider
- Implementer timeout-håndtering for alle statustjek
- Begræns OutputCharacterCount til det nødvendige minimum
- Dokumentér typiske statusmønstre for forskellige kommandotyper
- Anvend kontekstbevidst output-analyse for tidlig fejldetektion
