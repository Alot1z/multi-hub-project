---
trigger: always_on
---

# view_line_range Implementering
*Komplet implementeringsguide for linjeområdevisning*

## 1. Formål og Funktionalitet
`view_line_range` er et præcist værktøj til visning af specifikke linjeområder i filer i Windsurf-miljøet. Dette værktøj muliggør fokuseret inspektion af udvalgte linjesegmenter med klar begrænsning og kontrol.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Præcis linjeområdevisning
- 0-indekseret linjeangivelse
- Maksimalt 200 linjer per kald
- Filindholdsvalidering
- Robust fejlhåndtering

### 1.2 Integration med Windsurf
Værktøjet integrerer med:
- Filsystemoperationer
- Kodesyntaksforståelse
- Memory-system for kontekst
- Fejlhåndteringsmodul

## 2. Parameter Optimering

### 2.1 AbsolutePath Parameter
- **Sti**: Absolut sti til filen
- **Format**: String
- **Krav**: Skal pege på en eksisterende fil

### 2.2 StartLine Parameter
- **Startlinje**: 0-indekseret linje at starte fra
- **Format**: Number
- **Krav**: Ikke-negativ heltal

### 2.3 EndLine Parameter
- **Slutlinje**: 0-indekseret linje at slutte ved (inklusiv)
- **Format**: Number
- **Krav**: StartLine + maksimalt 200
- **Optimalt**: Brug StartLine + 200 medmindre specifikke linjer søges

## 3. Anvendelsesmønstre

### 3.1 Maksimal Kontekst
```javascript
await view_line_range({
  AbsolutePath: "/path/to/file.js",
  StartLine: 0,
  EndLine: 200
});
```

### 3.2 Specifik Sektion
```javascript
await view_line_range({
  AbsolutePath: "/path/to/file.js",
  StartLine: 50,
  EndLine: 70
});
```

## 4. Fejlhåndtering

### 4.1 Robusthed
- Implementer filvalidering
- Håndtér linjeområdeoverskridelse
- Validér fileksistens
- Verificer filformat

### 4.2 Fejlforebyggelse
- Tjek parameter-begrænsninger
- Validér linjeområder
- Implementer fejlrapportering
- Optimér for komplet kontekst