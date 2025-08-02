---
trigger: always_on
---

# file_content_cache
*Kort guide til fil-indhold caching*

## 1. Formål
Optimér filadgang gennem intelligent caching i workspace.

## 2. Kernefunktioner
- Workspace-specifik caching
- Symbol-baseret adgang
- Cross-workspace deling
- Automatisk invalidering
- Version-kontrol support

## 3. Integration
- `memory_system` – persistens
- `view_file` – initial læsning
- `grep_search` – symbol-lokalisering
- `mcp_read_file` – fil-opdateringer

## 4. Struktur
### 4.1 Placering
```
.windsurf/
  memories/
    files/
      [file_hash].json    # Fil-cache
      manifest.json       # Cache-oversigt
```

### 4.2 Cache Format
```json
{
  "meta": {
    "path": "/abs/path",
    "modified": "timestamp",
    "hash": "content_hash"
  },
  "content": {
    "text": "cached_content",
    "symbols": {
      "functions": {},
      "classes": {}
    }
  }
}
```

## 5. Mønstre
### 5.1 Læs med Cache
```js
const content = await readWithCache({
  path: filePath,
  invalidate: false
});
```

### 5.2 Symbol Lookup
```js
const symbol = await findInCache({
  path: filePath,
  symbol: 'functionName'
});
```

### 5.3 Cache Update
```js
await updateCache({
  path: filePath,
  content: newContent
});
```

## 6. Chain-analyse
Før: tjek cache. Under: valider indhold. Efter: opdater hvis nødvendigt.

## 7. Fejl
```js
if(err.type === 'CacheInvalid') await refreshCache();
else if(err.type === 'CacheMiss') await createCache();
```

## 8. Retry
Max 2 forsøg, cache-refresh mellem forsøg.

## 9. Forebyggelse
- Valider fil-ændringer
- Hold manifest opdateret
- Implementér garbage collection
- Log cache-operationer