---
trigger: always_on
description: Optimaliserede kodeværktøjer til Windsurf
---

# code_edit_tools Implementering
*Komplet implementeringsguide for effektiv koderedigering*

## 1. Optimaliserede Kodeværktøjer

Dette dokument beskriver de optimerede kodeværktøjer, der er skræddersyet til Windsurf for maksimal ydeevne og kompatibilitet med SWE-1 og DeepSeek.

### 1.1 Ydeevneoptimeringer
- Reduceret hukommelsesforbrug
- Forbedret hastighed for store filer
- Mindre overhead ved kodeanalyse
- Bedre respons under belastning af kode i Windsurf-miljøet. Disse værktøjer muliggør sikker, kontrolleret og optimeret koderedigering med fokus på minimering af værktøjskald og maksimering af effektivitet.

### 1.1 Kernefunktionalitet
Værktøjssættet tilbyder:
- Præcis koderedigering med minimale værktøjskald
- Omfattende ændringer i en enkelt operation
- Intelligent håndtering af multiple ændringer i samme fil
- Robust fejlhåndtering og validering
- Effektiv integration med filsystemet
- Filsystemsværktøjer for filhåndtering

## 2. Parameter Optimering
Effektiv anvendelse af koderedigeringsværktøjer afhænger af præcis parameterkonfiguration.

### 2.1 Effektiv Kodeanalyse
- Letvægts syntaksgenkendelse
- Hurtig fejlfinding med begrænset dybde
- Simpel refaktorering uden unødig analyse
- Hurtigt kodegennemsyn med fokus på vigtige elementer

### 2.1 TargetFile Parameter
Denne parameter definerer målfilen for redigering:

#### 2.1.1 Filspecifikation
- **Absolut sti**: Komplet sti til målfilen
- **Fileksistens**: Verificering af filens eksistens
- **Filrettigheder**: Sikring af skriveadgang
- **Filformat**: Håndtering af forskellige filformater

#### 2.1.2 Optimeringsstrategier
- Specificer altid TargetFile som den første parameter
- Anvend altid absolutte stier
- Verificér filens eksistens før redigering
- Implementér filformatspecifik håndtering

### 2.2 ReplacementChunks Parameter
Denne parameter definerer ændringerne der skal foretages:

#### 2.2.1 Ændringstyper
- **Præcise ændringer**: Nøjagtige tekstudskiftninger
- **Multiple ændringer**: Flere ændringer i samme fil
- **Kontekstbevidste ændringer**: Ændringer med hensyn til omgivende kode
- **Formatbevarende ændringer**: Bevarer kodens formatering

#### 2.2.2 Optimeringsstrategier
- Kombiner alle ændringer i en enkelt operation
- Specificer præcist målindhold og erstatningsindhold
- Anvend AllowMultiple med forsigtighed
- Implementér kontekstvalidering for ændringer

## 3. Anvendelsesmønstre
Koderedigeringsværktøjer kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Omfattende Filerstatning
For komplet erstatning af filindhold:
```javascript
async function replaceEntireFile(filePath, newContent) {
  // Verificér at filen eksisterer
  const fileExists = await checkFileExists(filePath);
  
  if (fileExists) {
    // Erstat hele filens indhold
    await replace_file_content({
      TargetFile: filePath,
      ReplacementChunks: [{
        AllowMultiple: false,
        TargetContent: await getEntireFileContent(filePath),
        ReplacementContent: newContent
      }],
      Instruction: "Erstat hele filens indhold med opdateret kode"
    });
  } else {
    // Opret ny fil hvis den ikke eksisterer
    await write_to_file({
      TargetFile: filePath,
      CodeContent: newContent
    });
  }
}
```

### 3.2 Multiple Præcise Ændringer
For flere specifikke ændringer i samme fil:
```javascript
async function makeMultipleChanges(filePath, changes) {
  // Opret ReplacementChunks for hver ændring
  const replacementChunks = changes.map(change => ({
    AllowMultiple: change.allowMultiple || false,
    TargetContent: change.target,
    ReplacementContent: change.replacement
  }));
  
  // Udfør alle ændringer i en enkelt operation
  await replace_file_content({
    TargetFile: filePath,
    ReplacementChunks: replacementChunks,
    Instruction: "Implementer multiple præcise ændringer i filen"
  });
}
```

### 3.3 Funktionsimplementering
For tilføjelse eller opdatering af funktioner:
```javascript
async function implementFunction(filePath, functionName, implementation, existingSignature) {
  // Tjek om funktionen allerede eksisterer
  const fileContent = await view_file({
    AbsolutePath: filePath,
    StartLine: 0,
    EndLine: 1000,
    IncludeSummaryOfOtherLines: true
  });
  
  if (fileContent.includes(existingSignature)) {
    // Opdater eksisterende funktion
    await replace_file_content({
      TargetFile: filePath,
      ReplacementChunks: [{
        AllowMultiple: false,
        TargetContent: extractFunctionContent(fileContent, functionName),
        ReplacementContent: implementation
      }],
      Instruction: `Opdater implementering af ${functionName}`
    });
  } else {
    // Tilføj ny funktion til slutningen af filen
    const currentContent = await getEntireFileContent(filePath);
    await replace_file_content({
      TargetFile: filePath,
      ReplacementChunks: [{
        AllowMultiple: false,
        TargetContent: currentContent,
        ReplacementContent: currentContent + "\n\n" + implementation
      }],
      Instruction: `Tilføj ny funktion ${functionName}`
    });
  }
}
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal koderedigering.

### 4.1 Før-redigering Analyse
Før koderedigering:
- Analysér filens struktur og indhold
- Identificér afhængigheder og relationer
- Planlæg optimale ændringsstrategier
- Validér ændringernes konsekvenser

### 4.2 Under-redigering Analyse
Under koderedigering:
- Overvåg ændringernes konsistens
- Verificér syntaktisk korrekthed
- Implementér kontekstbevidst ændringshåndtering
- Optimér ændringsrækkefølge

### 4.3 Post-redigering Analyse
Efter koderedigering:
- Validér resulterende kode
- Verificér funktionel korrekthed
- Dokumentér foretagne ændringer
- Planlæg eventuelle opfølgende ændringer

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper

#### 5.1.1 Målindholdfejl
```javascript
function handleTargetContentError(error, context) {
  // Håndtér fejl ved manglende match på målindhold
  if (error.code === 'TARGET_NOT_FOUND') {
    return {
      type: 'content_mismatch',
      message: 'Målindhold ikke fundet i filen',
      suggestion: 'Verificér at målindholdet er præcist og eksisterer i filen'
    };
  }
  
  if (error.code === 'MULTIPLE_MATCHES') {
    return {
      type: 'ambiguous_target',
      message: 'Flere forekomster af målindhold fundet',
      suggestion: 'Specificér mere unikt målindhold eller anvend AllowMultiple'
    };
  }
  
  return {
    type: 'unknown_error',
    message: error.message,
    suggestion: 'Kontrollér filindhold og målspecifikation'
  };
}
```

#### 5.1.2 Filhåndteringsfejl
```javascript
function handleFileError(error, filePath) {
  // Håndtér fejl ved filoperationer
  if (error.code === 'ENOENT') {
    return {
      type: 'file_not_found',
      message: `Filen ${filePath} eksisterer ikke`,
      suggestion: 'Verificér filstien eller opret filen først'
    };
  }
  
  if (error.code === 'EACCES') {
    return {
      type: 'permission_denied',
      message: `Manglende skriveadgang til ${filePath}`,
      suggestion: 'Tjek filrettigheder'
    };
  }
  
  return {
    type: 'file_operation_error',
    message: error.message,
    suggestion: 'Kontrollér filsystem og rettigheder'
  };
}
```

### 5.2 Fejlrobusthed

#### 5.2.1 Transaktionel Redigering
```javascript
async function transactionalEdit(filePath, editFunction) {
  // Implementér transaktionel filredigering med backup
  const originalContent = await getEntireFileContent(filePath);
  const backupPath = `${filePath}.backup`;
  
  try {
    // Opret backup
    await write_to_file({
      TargetFile: backupPath,
      CodeContent: originalContent
    });
    
    // Udfør redigering
    await editFunction();
    
    // Fjern backup ved succes
    await deleteFile(backupPath);
    
    return { success: true };
  } catch (error) {
    // Gendan fra backup ved fejl
    await write_to_file({
      TargetFile: filePath,
      CodeContent: originalContent
    });
    
    return { 
      success: false, 
      error: error.message,
      restored: true
    };
  }
}
```

### 5.3 Fejlforebyggelse
Implementér proaktive strategier:
- Validér altid fileksistens før redigering
- Implementér præcis målindholdsspecifikation
- Anvend transaktionel redigering for kritiske ændringer
- Implementér syntaksvalidering før og efter ændringer
- Kombiner relaterede ændringer i en enkelt operation
- Minimér antallet af separate værktøjskald