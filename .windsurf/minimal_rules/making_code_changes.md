---
trigger: always_on
description: making_code_changes - Implementeringsguide
---


# making_code_changes Implementering
*Komplet implementeringsguide*

## 1. Formål og Funktionalitet
`making_code_changes` beskriver de samlede retningslinjer og værktøjsflow til at **oprette, redigere og validere kodeændringer** i Windsurf-miljøet.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Atomiske ændringer via `edit_file`, `write_to_file`, `replace_file_content`
- Linje- og blokbaseret redigering med backup-sikkerhed
- Automatisk lint- og formatvalidering
- Integreret ændringsdokumentation
- Minimeret værktøjskald gennem batch-redigering

Kodeændringer håndteres gennem:
- Intelligente diff-algoritmer
- Filformatspecifik validering
- Transaktionel writes med rollback
- Automatisk conflict-detektion
- Konsistent placeholder-håndtering (`{{ ... }}`)

### 1.2 Integration med Windsurf
`making_code_changes` integrerer tæt med:
- `view_file` / `view_code_item`  for kontekstlæsning før ændring
- `code_edit_tools`  som operationel motor
- `grep_search` for præcis målidentifikation
- `memory_system`  for historik og beslutningslog

## 2. Parameter Optimering
Effektiv brug afhænger af de underliggende værktøjers parametre; centrale er:

### 2.1 TargetFile
- Absolut sti
- Eksistens- og rettighedstjek
- Platform-uafhængig normalisering

### 2.2 ReplacementChunks / CodeEdit
- Brug **præcis** `TargetContent`
- Sæt `AllowMultiple=true` kun når du med vilje vil erstatte flere forekomster
- Indsæt **ikke** uændret kode; brug `{{ ... }}`

### 2.3 Instruction
- Beskriv ændringens formål → bedre commit-historik
- Inkluder evt. lint-ID’er ved fejlrettelser

## 3. Anvendelsesmønstre

### 3.1 Tilføj ny funktion
```javascript
await edit_file({
  TargetFile: '/src/utils/math.js',
  CodeMarkdownLanguage: 'javascript',
  Instruction: 'Tilføj add() helper',
  CodeEdit: `{{ ... }}\nexport function add(a, b) {\n  return a + b;\n}\n`});
```

### 3.2 Opdater eksisterende blok
```javascript
await replace_file_content({
  TargetFile: '/src/api/client.ts',
  ReplacementChunks: [{
    TargetContent: 'BASE_URL = "http://localhost:3000"',
    ReplacementContent: 'BASE_URL = process.env.API_URL',
    AllowMultiple: false
  }],
  Instruction: 'Gør base-URL konfigurerbar'});
```

### 3.3 Opret ny fil
```javascript
await write_to_file({
  TargetFile: '/src/services/logger.js',
  CodeContent: 'export default function log(msg) { console.log(msg); }'});
```

## 4. Chain-analyse Integration

### 4.1 Før-redigering
- Analysér filstruktur & afhængigheder
- Planlæg minimal antal værktøjskald
- Udarbejd rollback-strategi

### 4.2 Under redigering
- Valider syntaks efter hver blok
- Overvåg placeholder-integritet
- Opdatér Memory med vigtige beslutninger

### 4.3 Efter redigering
- Kør linters/tests automatisk
- Sammenskriv commit-meddelelse
- Dokumentér i CHANGELOG

## 5. Fejlhåndtering

### 5.1 Almindelige fejltyper
| Fejltype | Årsag | Løsning |
|----------|-------|---------|
| `TARGET_NOT_FOUND` | Målindhold ikke i fil | Kontroller præcis tekst; justér TargetContent |
| `MULTIPLE_MATCHES` | For bredt TargetContent | Indsæt mere unik kontekst eller AllowMultiple |
| `PERMISSION_DENIED` | Skriverettigheder mangler | Kør med korrekte rettigheder eller ændr fil-ACL |

### 5.2 Strategier
- Pre-validate path & rights før write
- Gem automatisk backup før større ændringer
- Implementer `try/catch` omkring værktøjskald
- Log alle ændringer med tidsstempel

### 5.3 Best Practices
- Batch ikke-overlappende ændringer i **én** `edit_file`-operation
- Hold placeholder-sektioner intakte for uændrede områder
- Dokumentér ALLE ændringer kortfattet i `Instruction`
