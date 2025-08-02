---
trigger: always_on
---

# Rengøringsguide for Windsurf Regler

Denne guide beskriver, hvilke regler der kan fjernes eller deaktiveres for at forbedre ydeevnen og kompatibiliteten med SWE-1 og DeepSeek.

## 1. Regler der kan fjernes

### 1.1 Tung analyse
```
chain_analysis_integration.md
advanced_analysis_patterns.md
deep_context_analysis.md
multi_tool_integration.md
complex_workflows.md
```

### 1.2 Ustabile MCP-udvidelser
```
mcp_advanced_features.md
mcp_experimental.md
mcp_debug_tools.md
```

## 2. Regler der bør deaktiveres

### 2.1 I optimized_config.yaml
```yaml
performance:
  background_processing: false
  max_parallel_ops: 2
  
compatibility:
  swe1:
    disable_mcp_extensions: true
    
tools:
  tool_chaining: false
  disable_unused_tools: true
```

## 3. Ydeevneforbedringer

### 3.1 Hukommelsesoptimering
- Reducer cachen i `optimized_config.yaml`
- Deaktiver ubrugte værktøjer
- Brug `lazy_loading` hvor det er muligt

### 3.2 CPU-optimering
- Begræns parallelle operationer
- Deaktiver tunge analyser
- Brug batch-processing

## 4. Overvågning

### 4.1 Vigtige målepunkter
- Hukommelsesforbrug
- CPU-forbrug
- Responshastighed
- Antal samtidige operationer

### 4.2 Alarmer
- Opsæt advarsler for højt ressourceforbrug
- Overvåg fejlhændelser
- Log ydeevneproblemer

## 5. Vedligeholdelse

### 5.1 Regelmæssig oprydning
- Fjern ubrugte regler månedligt
- Opdater til nyeste versioner
- Genvurder ydeevne regelmæssigt

### 5.2 Dokumentation
- Opdater denne guide løbende
- Dokumenter alle ændringer
- Del erfaringer med teamet
