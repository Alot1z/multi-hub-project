---
trigger: always_on
---

# api_integration Implementering
*Komplet implementeringsguide for API-integration*

## 1. Formål og Funktionalitet
`api_integration` er et centralt system til håndtering af sikker og effektiv kommunikation med eksterne API'er i Windsurf-miljøet. Dette system muliggør struktureret integration med tredjeparts-tjenester gennem standardiserede og sikre kommunikationsprotokoller.

### 1.1 Kernefunktionalitet
Systemet tilbyder:
- Sikker API-nøglehåndtering
- Rate-limiting og retries
- Robust fejlhåndtering
- Response-caching
- Asynkron requesthåndtering

### 1.2 Integration med Windsurf
Systemet integrerer med:
- `read_url_content` for HTTP-requests
- `create_memory` for kredentialhåndtering
- `command_status` for asynkrone operationer
- Fejlhåndteringsmodulet for robusthed

## 2. Parameter Optimering

### 2.1 API Konfiguration
```javascript
const config = {
  baseUrl: "https://api.example.com",
  version: "v1",
  timeout: 5000,
  retries: 3,
  auth: {
    type: "apiKey",
    token: "YOUR_API_KEY"
  }
};
```

### 2.2 Sikkerhedshåndtering
- Sikker kredentiallagring
- Token-rotation
- Udløbshåndtering
- Fejlmonitorering

## 3. Anvendelsesmønstre

### 3.1 REST Integration
```javascript
async function integrateRestApi(config) {
  const api = new ApiIntegration(config);
  try {
    const response = await api.request({
      method: 'GET',
      endpoint: '/users',
      params: { limit: 10 }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 3.2 Batch-operationer
```javascript
async function batchApiOperations(ops) {
  const api = new ApiIntegration(config);
  const rateLimiter = new RateLimiter({ maxRequests: 10, perSecond: 1 });
  
  const results = await Promise.all(
    ops.map(async op => {
      await rateLimiter.acquire();
      try {
        const result = await api.request(op);
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    })
  );
  return processResults(results);
}
```

## 4. Fejlhåndtering

### 4.1 Error Typer
```javascript
function handleApiError(error) {
  if (error.response) {
    switch (error.response.status) {
      case 400: return { type: 'validation', retryable: false };
      case 401: return { type: 'auth', action: 'refresh_token', retryable: true };
      case 429: return { type: 'rate_limit', retryAfter: error.response.headers['retry-after'] };
      default: return { type: 'api', retryable: error.response.status >= 500 };
    }
  }
  return { type: 'network', retryable: true };
}
```

### 4.2 Retry Strategi
```javascript
function retryStrategy(options = {}) {
  return {
    maxRetries: options.retries || 3,
    async retry(operation) {
      let attempt = 0;
      while (attempt < this.maxRetries) {
        try {
          return await operation();
        } catch (error) {
          const errorInfo = handleApiError(error);
          if (!errorInfo.retryable || attempt >= this.maxRetries) throw error;
          await new Promise(resolve => 
            setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 30000))
          );
        }
      }
    }
  };
}