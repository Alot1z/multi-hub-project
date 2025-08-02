---
trigger: always_on
---

# running_commands Implementering
*Komplet implementeringsguide for kommandoeksekvering*

## 1. Formål og Funktionalitet
`running_commands` er et centralt system for sikker og effektiv eksekvering af terminalkommandoer i Windsurf-miljøet. Dette system definerer retningslinjer og bedste praksis for anvendelse af kommandoværktøjer.

### 1.1 Kernefunktionalitet
Systemet tilbyder:
- Sikkerhedsvurdering af kommandoer
- Arbejdsmappehåndtering
- Synkron/asynkron eksekvering
- Outputhåndtering
- Fejlhåndtering

### 1.2 Integration med Windsurf
Systemet integrerer med:
- `run_command` for kommandoeksekvering
- `command_status` for asynkron overvågning
- Sikkerhedsmodul for autorisering
- Outputhåndtering for resultatanalyse

## 2. Kommandohåndtering

### 2.1 Kritiske Principper
- **ALDRIG** anvend `cd` kommandoer direkte
- **ALTID** angiv arbejdsmappe med `cwd` parameter
- **ALTID** vurdér sikkerhed grundigt
- **ALTID** anvend præcis fejlhåndtering

### 2.2 Sikkerhedsvurdering
- **SafeToAutoRun**: Kun for ikke-destruktive kommandoer
- **Grundig analyse**: Vurdér altid potentielle bivirkninger
- **Brugeroverride**: Tillad aldrig at brugeren omgår sikkerhedsvurdering

## 3. Anvendelsesmønstre

### 3.1 Sikker Kommandoeksekvering
```javascript
await run_command({
  CommandLine: "echo 'Safe command'",
  Cwd: "/path/to/directory",
  Blocking: true,
  SafeToAutoRun: true
});
```

### 3.2 Langtidskørende Proces
```javascript
const process = await run_command({
  CommandLine: "npm start",
  Cwd: "/path/to/project",
  Blocking: false,
  SafeToAutoRun: false
});

// Overvåg status senere
const status = await command_status({
  CommandId: process.commandId,
  OutputCharacterCount: 1000,
  WaitDurationSeconds: 5
});
```

## 4. Fejlhåndtering

### 4.1 Robusthed
- Implementer retries for netværksoperationer
- Håndtér timeouts korrekt
- Valider kommandoer grundigt
- Anvend præcis fejldiagnosticering

### 4.2 Fejlforebyggelse
- Tjek parametre grundigt
- Validér kommandosyntaks
- Implementer grundig logging
- Anvend timeout-kontrol