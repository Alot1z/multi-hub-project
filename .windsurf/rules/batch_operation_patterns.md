---
trigger: always_on
---

# Batch Operation Patterns
*Kort guide til effektiv batch-håndtering*

## 1. Formål
Optimer og kør flere operationer sikkert med minimal ressourcebrug.

## 2. Kernefunktioner
- Smart gruppering
- Rate-limit & throttling
- Parallel eksekvering
- Fejltolerance
- Progress tracking

## 3. Integration
- `mcp0_read_multiple_files` – batch fil-læs
- `command_status` – procesmonitor
- `api_integration` – batch API-kald
- `error_recovery_workflows` – recovery

## 4. Parametre
### 4.1 Batch-størrelse
| Type   | Ops     | Brug           |
| ------ | ------- | -------------- |
| Small  | 1-10    | Lav belastning |
| Medium | 11-50   | Normal         |
| Large  | 51-200  | Høj            |
| Custom | valgfri | Tilpas         |

### 4.2 Concurrency
Sequential • Limited(2-5) • Balanced(6-15) • High(16+)

## 5. Mønstre
### 5.1 Parallel fil-læs
```js
const batches = chunk(files, 10);
for (const b of batches) {
  const res = await Promise.all(b.map(f=>mcp0_read_file({path:f})));
  await sleep(100);
}
```

### 5.2 Batch API
```js
await Promise.all(reqs.map(async r=>{
  await limiter.acquire();
  return api.request(r).catch(e=>({err:e.message}));
}));
```

### 5.3 Fil-ops
Gruppér read / write / delete → kør i optimal rækkefølge.

## 6. Chain-analyse
Før: estimer forbrug, plan batch. Under: monitor & justér. Efter: mål effektivitet, log læring.

## 7. Fejl
```js
if(err.type==='rate_limit') retry();
else if(err.type==='partial') handlePartial();
```
Concurrency-fejl → reducer connections eller pool resources.

## 8. Retry
Eksponentiel backoff, max 3 forsøg, tilpas batch-størrelse ved ressourcemangel.

## 9. Forebyggelse
Valider input, pool ressourcer, adaptiv batch, circuit-breaker, detaljeret logging.
