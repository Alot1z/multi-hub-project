---
activation: ALWAYS ON
description: Rule - Dataklasse til regelpræsentation
version: 1.0
---

# Rule Implementering
*Komplet implementeringsguide for regelpræsentation*

## 1. Funktionsbeskrivelse
Rule er en dataklasse, der repræsenterer en enkelt regel i Windsurf-regelmotoren. Denne klasse fungerer som den grundlæggende datastruktur for alle regler i systemet og indeholder al nødvendig metadata og logik til at beskrive, kategorisere og håndtere regler. 

Klassen indeholder følgende kerneelementer:
- Unik identifikation via ID
- Beskrivende navn og forklaringstekst
- Aktiveringstilstand (enabled/disabled)
- Prioritetsangivelse for regelevaluering
- Kategorisering via tags
- Betingelselogik til aktivering
- Handlinger der skal udføres ved regelaktivering

Rule-klassen fungerer som en struktureret datacontainer, der sikrer konsistens i regelrepræsentation på tværs af hele regelsystemet og muliggør effektiv serialisering/deserialisering til og fra YAML-filer.

## 2. Konfigurationsparametre
Rule-dataklassen har følgende centrale parametre:

### 2.1 Obligatoriske Parametre
- **id**: `str` - Unik identifikator for reglen
  - Format: Snake_case strengidentifikator
  - Eksempel: "memory_optimization_rule"
  - Bør være unik på tværs af alle regler

- **name**: `str` - Menneskelæsbart navn for reglen
  - Format: Kort, beskrivende titel
  - Eksempel: "Hukommelsesoptimering for SWE-1"

- **description**: `str` - Detaljeret beskrivelse af regelformål
  - Format: 1-3 sætninger der forklarer regelformål
  - Eksempel: "Optimerer hukommelsesforbrug for SWE-1 modellen"

### 2.2 Valgfrie Parametre
- **enabled**: `bool` - Angiver om reglen er aktiv (default: True)
- **priority**: `int` - Prioritet for regelevaluering (default: 0)
  - Højere værdier indikerer højere prioritet
  - Regler med samme prioritet evalueres i vilkårlig rækkefølge

- **tags**: `List[str]` - Liste af kategoriseringstags
  - Format: Liste af strenge i snake_case
  - Eksempel: ["memory", "optimization", "swe1"]

- **conditions**: `Dict[str, Any]` - Betingelser for regelaktivering
  - Format: Nøgle-værdi par af betingelser
  - Eksempel: {"model_type": "swe1", "memory_pressure": "high"}

- **actions**: `List[Dict[str, Any]]` - Handlinger ved regelaktivering
  - Format: Liste af handlingsdictionaries
  - Eksempel: [{"type": "adjust_memory", "params": {"limit_mb": 4096}}]

## 3. Anvendelsesstrategier
Rule-dataklassen kan anvendes i forskellige scenarier med følgende optimale strategier:

### 3.1 Regeldefinition
```python
# Opret en ny optimeringsregel
memory_rule = Rule(
    id="memory_optimization_rule",
    name="Hukommelsesoptimering",
    description="Reducerer hukommelsesforbrug for modeller",
    priority=10,
    tags=["memory", "optimization"],
    conditions={"model_type": "swe1"},
    actions=[
        {"type": "set_limit", "params": {"memory_mb": 4096}}
    ]
)
```

### 3.2 Regelserialisering
```python
# Konverter regel til dictionary format til lagring
rule_dict = memory_rule.to_dict()
# Gem regel til YAML-fil
with open('memory_rule.yaml', 'w') as f:
    yaml.dump(rule_dict, f)
```

### 3.3 Regeldeserialisering
```python
# Indlæs regel fra dictionary
with open('memory_rule.yaml', 'r') as f:
    rule_data = yaml.safe_load(f)
# Gendan regel-objekt
loaded_rule = Rule.from_dict(rule_data)
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal regelanvendelse.

### 4.1 Før-regel Analyse
Før regeloprettelse:
- Analysér regelformål og kontekst
- Identificér optimale betingelser baseret på anvendelsesområde
- Planlæg handlingssekvenser der skal aktiveres
- Definer meningsfulde tags for kategorisering

### 4.2 Under-regel Analyse
Under regelanvendelse:
- Validér regelaktivering og betingelser
- Overvåg handlingseksekvering og resultater
- Spor regelpræstation og effektivitet
- Implementér fejlhåndtering for regelprocessering

### 4.3 Post-regel Analyse
Efter regelanvendelse:
- Evaluer regeleffektivitet og præcision
- Opdater betingelser baseret på observerede mønstre
- Raffinér handlinger for bedre resultater
- Dokumentér regelbrug og -effekt

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper
- **Manglende Obligatoriske Felter**: Sikr at id, name og description altid er angivet
- **Invalide Datatyper**: Validér at alle felter har korrekte datatyper (især lister og dictionaries)
- **Duplikerede ID'er**: Tjek for og undgå regelkonflikter med samme ID
- **Ugyldige Handlingsparametre**: Validér at alle handlingsparametre er gyldige og komplette

### 5.2 Fejlrobusthed
Implementér robusthedsstrategier for Rule-klassen:
- Validér alle input før regeloprettelse
- Implementér default-værdier for valgfrie parametre
- Anvend eksplicit typetjek ved deserialisering
- Implementér grundig fejlrapportering ved problemer

### 5.3 Fejlforebyggelse
For at undgå almindelige fejl:
- Definer tydelige navngivningskonventioner for regel-ID'er
- Dokumentér regelformål og -anvendelse grundigt
- Implementér central registrering af regler for at undgå konflikter
- Test regelaktivering og -handlinger i isolerede miljøer
