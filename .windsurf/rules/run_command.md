---
trigger: always_on
---

# run_command Implementering
*Komplet implementeringsguide for sikker kommandoeksekvering*

## 1. Formål og Funktionalitet
`run_command` er et kraftfuldt værktøj til sikker eksekvering af terminalkommandoer i Windsurf-miljøet. Dette værktøj muliggør kontrolleret interaktion med operativsystemet via kommandolinje med omfattende sikkerhedsmekanismer.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Sikker kommandoeksekvering
- Arbejdsmappekontrol
- Synkron/asynkron eksekvering
- Sikkerhedsvurdering
- Omfattende fejlhåndtering

### 1.2 Integration med Windsurf
Værktøjet integrerer med:
- Operativsystem-shell
- Processtyring
- Fejlrapportering
- Sikkerhedsmodul

## 2. Parameter Optimering

### 2.1 CommandLine Parameter
- **Kommando**: Præcis kommandostreng
- **Format**: String
- **Vigtigt**: Inkluder aldrig `cd` kommandoer

### 2.2 Cwd Parameter
- **Arbejdsmappe**: Absolut sti
- **Format**: String
- **Formål**: Erstatning for `cd` kommandoer

### 2.3 Blocking Parameter
- **Boolean**: true/false
- **true**: Vent på afslutning
- **false**: Kør i baggrunden

### 2.4 SafeToAutoRun Parameter
- **Boolean**: true/false
- **true**: Sikker at køre automatisk
- **false**: Kræver brugerbekræftelse

## 3. Anvendelsesmønstre

### 3.1 Synkron Kommando
```javascript
await run_command({
  CommandLine: "echo 'Hello World'",
  Cwd: "/path/to/directory",
  Blocking: true,
  SafeToAutoRun: true
});
```

### 3.2 Asynkron Serverproces
```javascript
const server = await run_command({
  CommandLine: "npm start",
  Cwd: "/path/to/project",
  Blocking: false,
  SafeToAutoRun: false
});
```

## 4. Fejlhåndtering

### 4.1 Robusthed
- Implementer timeout-håndtering
- Håndtér procesfejl
- Valider kommandoer
- Verificer output

### 4.2 Fejlforebyggelse
- Undgå `cd` kommandoer
- Validér sikkerhed nøje
- Implementer logging
- Optimér ressourcehåndtering