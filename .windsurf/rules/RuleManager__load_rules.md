---
activation: ALWAYS ON
description: RuleManager._load_rules - Indlæsning af regler fra YAML-filer
version: 1.0
---

# RuleManager._load_rules Implementering
*Komplet implementeringsguide for regelindlæsning*

## 1. Funktionsbeskrivelse
`_load_rules` er en intern metode i RuleManager-klassen, der er ansvarlig for at indlæse alle regelfiler fra den angivne regelmappe. Denne metode gennemløber alle YAML-filer i regelmappen, parser deres indhold, og konverterer dem til Rule-objekter, der gemmes i RuleManager-instansens hukommelse.

Metoden håndterer følgende centrale processer:
- Validering af regelmappe-eksistens
- Gennemløb af alle .yaml filer i regelmappen
- Parsing af YAML-indhold til Python dictionaries
- Håndtering af både enkelt- og multi-regelformater
- Konvertering af regel-dictionaries til Rule-objekter
- Registrering af regel-til-fil relationer
- Robust fejlhåndtering under indlæsningsprocessen

Denne metode er afgørende for RuleManager's initialisering, da den sikrer, at alle definerede regler er tilgængelige for senere evaluering og eksekvering.

## 2. Konfigurationsparametre
`_load_rules` er en parameterløs metode, men påvirkes af RuleManager-initialiseringen:

### 2.1 Afhængige Parametre
- **self.rules_dir**: `Path` - Path-objekt til regelmappen
- **self.rules**: `Dict[str, Rule]` - Dictionary der opdateres med indlæste regler
- **self.rule_files**: `Dict[str, str]` - Dictionary der opdateres med regel-til-fil mapping

## 3. Anvendelsesstrategier
`_load_rules` kaldes typisk automatisk under RuleManager-initialisering, men kan også anvendes til genindlæsning af regler:

### 3.1 Automatisk Indlæsning ved Initialisering
```python
# Indlæser automatisk regler ved initialisering
rule_manager = RuleManager(rules_dir="config/rules")
# _load_rules kaldes internt under initialisering
```

### 3.2 Genindlæsning af Regler
```python
# Genindlæs regler efter filændringer
rule_manager = RuleManager(rules_dir="config/rules")

# Efter ændringer i regelfiler
rule_manager.rules.clear()
rule_manager.rule_files.clear()
rule_manager._load_rules()  # Genindlæs alle regler
```

### 3.3 Regel-Refresh Mønster
```python
# Implementering af refresh-metode der bruger _load_rules
def refresh_rules(self):
    """Genindlæs alle regler fra disk"""
    old_rules = self.rules.copy()
    self.rules.clear()
    self.rule_files.clear()
    
    self._load_rules()  # Genindlæs regler
    
    # Log ændringer
    new_rules = set(self.rules.keys())
    old_rule_set = set(old_rules.keys())
    added = new_rules - old_rule_set
    removed = old_rule_set - new_rules
    
    for rule_id in added:
        logger.info(f"Ny regel indlæst: {rule_id}")
    
    for rule_id in removed:
        logger.info(f"Regel fjernet: {rule_id}")
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal regelindlæsning.

### 4.1 Før-indlæsning Analyse
Før regelindlæsning:
- Verificér regelmappe-eksistens og -struktur
- Analysér YAML-filformater og -konventioner
- Planlæg indlæsningsstrategi baseret på filantal og -størrelse
- Forbered caching-strategi for effektiv indlæsning

### 4.2 Under-indlæsning Analyse
Under regelindlæsning:
- Overvåg fildekodning og parsing
- Validér regel-struktur og -indhold
- Detektér duplikerede regel-ID'er
- Implementér progress tracking ved mange filer

### 4.3 Post-indlæsning Analyse
Efter regelindlæsning:
- Validér at alle regler er korrekt indlæst
- Tjek for inkonsistens i regeldata
- Optimér hukommelsesforbrug for store regelsæt
- Generer regelstatistik og -oversigter

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper
- **Manglende Regelmappe**: Når den angivne regelmappe ikke findes
- **Ugyldig YAML-formatering**: Når regelfiler indeholder ugyldig YAML-syntax
- **Manglende Obligatoriske Felter**: Når regler mangler påkrævede felter
- **Duplikerede Regel-ID'er**: Når flere regler har samme ID

### 5.2 Fejlrobusthed
Implementér robusthedsstrategier for regelindlæsning:
- Anvend try/except blokke for individuelle filindlæsninger
- Fortsæt indlæsning selv ved enkelte filfejl
- Log detaljerede fejlbeskeder med filnavn og linje
- Anvend default-værdier ved manglende valgfri felter

### 5.3 Fejlforebyggelse
For at forebygge almindelige fejl:
- Validér regelfilformater før deployment
- Implementér versioning af regelformater
- Anvend strenge navngivningskonventioner for regel-ID'er
- Automatisér regelvalidering før commit
- Anvend skemavalidering for regelformater
- Implementér regelfilbackups før større ændringer
