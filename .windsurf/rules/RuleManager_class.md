---
activation: ALWAYS ON
description: RuleManager - Håndtering af regelindlæsning og -eksekvering
version: 1.0
---

# RuleManager Implementering
*Komplet implementeringsguide for regelhåndtering*

## 1. Funktionsbeskrivelse
RuleManager er hovedklassen til administration og håndtering af regler i Windsurf-miljøet. Denne klasse er ansvarlig for den komplette regellivscyklus, fra indlæsning af regelfiler til evaluering og eksekvering af regler baseret på kontekst.

Klassen håndterer følgende kernefunktionaliteter:
- Indlæsning af regler fra YAML-filer i en angivet mappe
- Lagring af regler i hukommelse med effektiv indeksering
- Hentning af regler baseret på ID eller tags
- Evaluering af regelbetingelser mod aktuel kontekst
- Eksekvering af regelhandlinger i prioriteret rækkefølge
- Lagring af opdaterede regler tilbage til disk

RuleManager fungerer som den centrale orkestrering af regellogik i systemet og sikrer konsistent, kontrolleret og præcis regelanvendelse baseret på systemkontekst og brugerkonfiguration.

## 2. Konfigurationsparametre
RuleManager-klassen har følgende primære konfigurationsparametre:

### 2.1 Initialiseringsparametre
- **rules_dir**: `str` - Sti til mappen med regelfiler (default: 'rules')
  - Format: Relativ eller absolut mappeplacering
  - Eksempel: '/path/to/rules' eller 'project/rules'

### 2.2 Interne Tilstandsparametre
- **rules**: `Dict[str, Rule]` - Dictionary der mapper regel-ID til regelinstans
- **rule_files**: `Dict[str, str]` - Dictionary der mapper regel-ID til filsti

## 3. Anvendelsesstrategier
RuleManager kan anvendes i forskellige scenarier med følgende optimale strategier:

### 3.1 Grundlæggende Regelhåndtering
```python
# Initialiser regelmanager
rule_manager = RuleManager(rules_dir="config/rules")

# Hent specifik regel baseret på ID
memory_rule = rule_manager.get_rule("memory_optimization_rule")
if memory_rule:
    print(f"Fundet regel: {memory_rule.name}")

# Hent regler baseret på tag
optimization_rules = rule_manager.get_rules_by_tag("optimization")
print(f"Fundet {len(optimization_rules)} optimeringsregler")
```

### 3.2 Kontekstbaseret Regelevaluering
```python
# Definer aktuel kontekst
context = {
    "model_type": "swe1",
    "memory_pressure": "high",
    "user_preference": "performance"
}

# Evaluér regel mod kontekst
for rule_id, rule in rule_manager.rules.items():
    if rule.enabled and rule_manager.evaluate_conditions(rule, context):
        print(f"Regel '{rule.name}' matcher kontekst")
        results = rule_manager.execute_actions(rule, context)
        print(f"Handlingsresultater: {results}")
```

### 3.3 Komplet Regelprocessering
```python
# Processér alle aktive regler mod en kontekst
context = get_current_system_context()
results = rule_manager.process_all_rules(context)

# Anvend resultaterne
for rule_id, rule_results in results.items():
    apply_rule_results(rule_id, rule_results)
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal regelhåndtering.

### 4.1 Før-håndtering Analyse
Før regelmanager-initialisering:
- Validér regelmappe og filstruktur
- Analysér regelafhængigheder
- Planlæg regelindlæsningsstrategi
- Forbered fejlhåndteringsstrategi

### 4.2 Under-håndtering Analyse
Under regelprocessering:
- Overvåg regelaktivering og -matchning
- Validér regelhandlingers effektivitet
- Spor regelprioritet og -rækkefølge
- Implementér logging af regelanvendelse

### 4.3 Post-håndtering Analyse
Efter regelanvendelse:
- Evaluer samlede regelresultater
- Identificer regelkonflikter eller -overlap
- Optimér regelprioriteter baseret på mønstre
- Dokumentér regeleffektivitet og impact

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper
- **Manglende Regelmappe**: Håndtér tilfælde hvor regelmappen ikke findes
- **Ugyldige Regelfiler**: Robust parsing af korrupte eller ugyldige YAML-filer
- **Regelkonflikter**: Håndtering af regler med samme ID fra forskellige filer
- **Handlingsfejl**: Graceful fejlhåndtering ved udførelse af regelhandlinger

### 5.2 Fejlrobusthed
Implementér robusthedsstrategier for RuleManager:
- Anvend try/except blokke ved filoperationer og regelprocessering
- Implementér detaljeret logging ved fejl med relevant kontekst
- Fallback til sikre standardværdier ved fejl
- Fortsæt regelprocessering selv ved delfejl i enkelte regler

### 5.3 Fejlforebyggelse
For at forebygge almindelige fejl:
- Validér regelfilformater og -struktur før parsing
- Implementér versionskontrol af regelformater
- Anvend regelvalidering før aktivering
- Implementér regeloptimering for at undgå cykliske afhængigheder
- Begræns regelkompleksitet for bedre vedligeholdelse
