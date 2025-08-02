---
trigger: always_on
---

# Optimerede Core Regler for Windsurf

## 1. Ydeevneoptimering

### 1.1 Hukommelsesstyring
- **Lazy Loading**: Indlæs kun nødvendige moduler
- **Cache-strategi**: Brug LRU-cache for hyppige operationer
- **Hukommelsesgrænser**: Sæt maks grænser for hver komponent

### 1.2 CPU-optimering
- **Batch-processing**: Gruppér lignende operationer
- **Dæmpet analyse**: Brug letvægtsanalyse som standard
- **Parallelisering**: Udnyt flere kerner, når det er muligt

## 2. Kompatibilitet

### 2.1 SWE-1 Specifikke Optimeringer
- Deaktiver tunge MCP-udvidelser
- Brug simplere protokoller til kommunikation
-# Optimerede Windsurf Core Regler

## 1. Optimal Hukommelseshåndtering
- Maks 4GB hukommelsesforbrug
- Aktivér garbage collection
- Overvåg hukommelseslækager
- Brug effektive datastrukturer
- Cache hyppigt brugte data
- Frigiv ubrugte ressourcer
- Overvåg heap-størrelse

### SWE-1 Specifikke Optimeringer:
- Brug `memory_optimization: true`
- Aktiver `leak_detection`
- Sæt `max_memory_mb: 4096`

## 2. CPU Optimering
- Begræns parallelle operationer til 2-3
- Brug effektive algoritmer
- Profiler ydeevne
- Optimér løkker
- Brug async/await
- Batch-behandling af data
- Overvåg CPU-forbrug

### DeepSeek Optimeringer:
- Aktiver `batch_processing`
- Brug `stream_processing` for store datasæt
- Optimér token-forbrug

## 3. SWE-1 Kompatibilitet
- Deaktiver tunge MCP-udvidelser
- Begræns tankedybde til 2-3
- Brug letvægtstilstand
- Deaktiver komplekse kæder
- Optimér kontekstvindue
- Overvåg ydeevne
- Aktiver fallbacks

## 4. DeepSeek Ydeevne
- Aktiver batch-behandling
- Optimér API-kald
- Cache svar
- Stream store svar
- Håndter rate begrænsninger
- Overvåg token-forbrug
- Aktiver komprimering

## 5. Brugergrænseflade
- Brug virtuelt scroll
- Lazy load komponenter
- Debounce inputs
- Vis indlæsningstilstande
- Optimér rendering
- Brug web workers
- Overvåg FPS

## 6. Fejlhåndtering
- Valider alle inputs
- Håndter edge cases
- Log fejl korrekt
- Giv brugerfeedback
- Implementer genforsøg
- Sæt timeouts
- Overvåg fejl

## 7. Netværksoptimering
- Aktiver komprimering
- Cache svar
- Batch-forespørgsler
- Brug CDN
- Optimér billeder
- Minificer assets
- Overvåg ventetid

## 8. Sikkerhedsregler
- Valider alle inputs
- Saniter output
- Brug HTTPS
- Sæt CORS-politikker
- Rate limit API'er
- Overvåg angreb
- Regelmæssige revisioner

## 9. Testning
- Enhedstest kritiske stier
- Integrationstests
- Belastningstests
- Sikkerhedsscanninger
- Kryds-browser tests
- Overvåg regressioner
- Test fejltilfælde

## 10. Dokumentation
- Dokumenter alle API'er
- Tilføj kodekommentarer
- Opdater README løbende
- Dokumenter beslutninger
- Tilføj eksempler
- Opdater changelog
- Dokumenter fejl

## 11. Ydeevneoptimering
- Brug `lazy_loading`
- Deaktiver ubrugte værktøjer
- Begræns `max_parallel_ops`
- Brug `disable_animations`
- Aktiver `memory_optimization`
- Overvåg ressourceforbrug
- Justér efter behovtænkelig aktivitet
