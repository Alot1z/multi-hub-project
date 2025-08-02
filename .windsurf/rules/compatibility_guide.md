---
trigger: always_on
---

# Kompatibilitetsguide for SWE-1 og DeepSeek

## 1. SWE-1 Specifikke Optimeringer

### 1.1 MCP Integration
- **Deaktiver unødvendige MCP-tjenester** for at undgå konflikter
- Brug letvægtsprotokoller til kommunikation
- Implementér eksplicitte timeout-værdier for alle eksterne kald

### 1.2 Hukommelsesforbrug
- Begræns kontekststørrelse til maks 4000 tokens
- Deaktiver dybe analysekæder
- Brug inkrementel indlæsning af store datasæt

## 2. DeepSeek Optimeringer

### 2.1 Effektiv Brug af API'er
- Batch-forespørgsler for at reducere antallet af kald
- Cache svar, når det er muligt
- Undgå unødvendige opkald under belastning

### 2.2 Fejltolerance
- Implementér robust fejlhåndtering
- Tilføj automatisk genforsøg for fejlende forespørgsler
- Log alle fejl med detaljeret kontekst

## 3. Fælles Optimeringer

### 3.1 Ydeevne
- Deaktiver unødvendige funktioner som standard
- Brug effektive datastrukturer
- Undgå unødvendige beregninger

### 3.2 Ressourcehåndtering
- Frigiv ressourcer omgående efter brug
- Overvåg ressourceforbrug i realtid
- Implementér begrænsninger for at forhindre overbelastning

## 4. Fejlfinding

### 4.1 Almindelige problemer
- **SWE-1 krasher**: Deaktiver MCP-udvidelser
- **Højt hukommelsesforbrug**: Reducer batch-størrelser
- **Langsom ydeevne**: Deaktiver dybe analyser

### 4.2 Ydeevnedata
- Mål responstider for kritiske operationer
- Overvåg hukommelsesforbrug under belastning
- Identificer flaskehalse med profiling

## 5. Bedste Praksis

### 5.1 Kodekvalitet
- Skriv ren, vedligeholdelig kode
- Dokumenter komplekse dele grundigt
- Test alle ændringer grundigt

### 5.2 Ydeevne
- Mål før og efter optimeringer
- Fokuser på de mest kritiske stier først
- Overvåg ydeevnen løbende

## 6. Konfigurationseksempler

### 6.1 SWE-1 Optimering
```yaml
swe1_optimization:
  disable_complex_analysis: true
  max_context_tokens: 4000
  disable_mcp_extensions: true
  enable_lightweight_mode: true
```

### 6.2 DeepSeek Optimering
```yaml
deepseek_optimization:
  batch_requests: true
  enable_caching: true
  max_retries: 3
  retry_delay_ms: 1000
```
