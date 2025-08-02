---
trigger: always_on
description: deploy_web_app - Implementeringsguide
---

# deploy_web_app Implementering
*Komplet implementeringsguide for effektiv web applikationsdeployment*

## 1. Formål og Funktionalitet
`deploy_web_app` er et kraftfuldt værktøj til deployment af JavaScript webapplikationer til hostingplatforme som Netlify. Dette værktøj muliggør automatiseret og sikker deployment af webapplikationer direkte fra kildefiler.

### 1.1 Kernefunktionalitet
Værktøjet tilbyder:
- Automatisk deployment til hostingplatforme
- Framework-specifik byggekonfiguration
- Intelligent projekt-ID håndtering
- Subdomain-konfiguration for nye sites
- Deployment-status overvågning

Deployment fungerer gennem:
- Intelligent framework-detektion
- Automatisk byggekonfiguration
- Sikker deployment-proces
- Status-tracking og -rapportering
- Fejlhåndtering og genopretning

### 1.2 Integration med Windsurf
Værktøjet integrerer tæt med:
- `read_deployment_config` for deployment-konfiguration
- `check_deploy_status` for deployment-overvågning
- `browser_preview` for site-prævisning
- Fejlhåndteringsmodulet for deployment-fejl

## 2. Parameter Optimering
Effektiv anvendelse af `deploy_web_app` afhænger af præcis parameterkonfiguration.

### 2.1 Framework Parameter
Denne parameter definerer webapplikationens framework:

#### 2.1.1 Framework-typer
- **Next.js**: React-baseret framework med SSR
- **Gatsby**: Statisk site generator for React
- **Nuxt.js**: Vue-baseret framework med SSR
- **SvelteKit**: Svelte-baseret framework
- **Astro**: Moderne statisk site generator

#### 2.1.2 Optimeringsstrategier
- Vælg korrekt framework for optimal bygning
- Sikr framework-version er understøttet
- Implementer framework-specifikke optimeringer
- Anvend framework-specifikke byggescripts

### 2.2 ProjectPath Parameter
Denne parameter definerer projektets placering:

#### 2.2.1 Sti-krav
- **Absolut sti**: Komplet sti fra rodmappen
- **Projektstruktur**: Skal indeholde nødvendige konfigurationsfiler
- **Byggefiler**: package.json, build scripts, etc.
- **Dependencies**: node_modules eller tilsvarende

#### 2.2.2 Optimeringsstrategier
- Verificer projektstruktur før deployment
- Sikr alle nødvendige filer er til stede
- Implementer pre-deployment validering
- Håndter platformspecifikke stier korrekt

### 2.3 ProjectId og Subdomain
Disse parametre styrer site-identifikation:

#### 2.3.1 Identifikationstyper
- **ProjectId**: Unik identifikator for eksisterende sites
- **Subdomain**: Domænenavn for nye sites
- **Kombineret**: Intelligent håndtering af begge

#### 2.3.2 Optimeringsstrategier
- Anvend eksisterende ProjectId når muligt
- Generer unikke subdomains for nye sites
- Implementer domænevalidering
- Håndter navnekonflikter intelligent

## 3. Anvendelsesmønstre
`deploy_web_app` kan anvendes i forskellige scenarier med specifikke optimeringsmønstre.

### 3.1 Ny Site Deployment
For deployment af en ny webapplikation:
```javascript
async function deployNewSite(projectPath, framework) {
  // Læs deployment-konfiguration
  const config = await read_deployment_config({
    ProjectPath: projectPath
  });
  
  // Generer unikt subdomain
  const subdomain = generateUniqueSubdomain(config.projectName);
  
  // Deploy applikationen
  const deployment = await deploy_web_app({
    Framework: framework,
    ProjectPath: projectPath,
    Subdomain: subdomain
  });
  
  // Overvåg deployment-status
  const status = await check_deploy_status({
    WindsurfDeploymentId: deployment.deploymentId
  });
  
  return {
    success: status.success,
    url: `https://${subdomain}.netlify.app`,
    deploymentId: deployment.deploymentId
  };
}
```

### 3.2 Eksisterende Site Opdatering
For opdatering af en eksisterende site:
```javascript
async function updateExistingSite(projectId, projectPath) {
  // Læs eksisterende konfiguration
  const config = await read_deployment_config({
    ProjectPath: projectPath
  });
  
  // Valider projekt-ID
  if (config.projectId !== projectId) {
    throw new Error('Projekt-ID matcher ikke eksisterende konfiguration');
  }
  
  // Deploy opdateringer
  const deployment = await deploy_web_app({
    ProjectId: projectId,
    ProjectPath: projectPath,
    Framework: config.framework
  });
  
  // Overvåg deployment-status
  return await check_deploy_status({
    WindsurfDeploymentId: deployment.deploymentId
  });
}
```

### 3.3 Framework-specifik Deployment
For deployment med framework-specifikke optimeringer:
```javascript
async function deployWithFrameworkOptimizations(projectPath, framework) {
  // Implementer framework-specifikke optimeringer
  const optimizations = getFrameworkOptimizations(framework);
  
  // Opdater byggekonfiguration
  await updateBuildConfig(projectPath, optimizations);
  
  // Deploy med optimeret konfiguration
  const deployment = await deploy_web_app({
    Framework: framework,
    ProjectPath: projectPath,
    Subdomain: generateFrameworkSubdomain(framework)
  });
  
  // Overvåg og rapportér status
  const status = await check_deploy_status({
    WindsurfDeploymentId: deployment.deploymentId
  });
  
  return {
    success: status.success,
    optimizations: optimizations.applied,
    buildTime: status.buildTime,
    deploymentUrl: status.url
  };
}
```

## 4. Chain-analyse Integration
Chain-analyse er afgørende for optimal deployment-håndtering.

### 4.1 Før-deployment Analyse
Før deployment:
- Validér projektkonfiguration og struktur
- Identificer framework og version
- Vurdér deployment-strategi
- Planlæg fejlhåndtering
- Forbered overvågningsstrategi

### 4.2 Under-deployment Analyse
Under deployment:
- Overvåg byggeproces og fremskridt
- Identificer potentielle problemer tidligt
- Spor ressourceforbrug
- Implementer fejlhåndtering
- Generer statusrapporter

### 4.3 Post-deployment Analyse
Efter deployment:
- Verificér deployment-succes
- Validér site-funktionalitet
- Dokumentér deployment-detaljer
- Planlæg opfølgende handlinger
- Opdater deployment-historik

## 5. Fejlhåndtering

### 5.1 Almindelige Fejltyper

#### 5.1.1 Byggefejl
```javascript
function handleBuildError(error, context) {
  // Analysér byggefejl
  const buildLogs = parseBuildLogs(error.logs);
  
  // Kategorisér fejl
  if (buildLogs.includes('Module not found')) {
    return {
      type: 'dependency_error',
      message: 'Manglende afhængighed detekteret',
      suggestion: 'Kør npm install før deployment'
    };
  }
  
  if (buildLogs.includes('Out of memory')) {
    return {
      type: 'resource_error',
      message: 'Byggeproces løb tør for hukommelse',
      suggestion: 'Øg bygge-ressourcer eller optimer build'
    };
  }
  
  return {
    type: 'unknown_build_error',
    message: error.message,
    logs: buildLogs
  };
}
```

#### 5.1.2 Deployment-fejl
```javascript
async function handleDeploymentError(error, deployment) {
  // Kategorisér deployment-fejl
  if (error.code === 'INVALID_FRAMEWORK') {
    return {
      type: 'framework_error',
      message: 'Framework ikke understøttet eller fejlkonfigureret',
      suggestion: 'Verificer framework og version'
    };
  }
  
  if (error.code === 'DOMAIN_CONFLICT') {
    // Generer alternativt subdomain
    const newSubdomain = await generateAlternativeSubdomain(deployment.subdomain);
    
    return {
      type: 'domain_error',
      message: 'Subdomain allerede i brug',
      suggestion: `Prøv med alternativt subdomain: ${newSubdomain}`
    };
  }
  
  return {
    type: 'deployment_error',
    message: error.message,
    deploymentId: deployment.deploymentId
  };
}
```

### 5.2 Fejlrobusthed

#### 5.2.1 Robust Deployment
```javascript
async function robustDeploy(config, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Validér konfiguration
      const validationResult = await validateDeployConfig(config);
      if (!validationResult.valid) {
        throw new Error(`Invalid config: ${validationResult.errors.join(', ')}`);
      }
      
      // Udfør deployment
      const deployment = await deploy_web_app(config);
      
      // Overvåg status
      const status = await check_deploy_status({
        WindsurfDeploymentId: deployment.deploymentId
      });
      
      if (status.success) {
        return deployment;
      }
      
      throw new Error(`Deployment fejlede: ${status.error}`);
    } catch (error) {
      console.error(`Deployment forsøg ${attempt} fejlede:`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Vent før næste forsøg
      await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
    }
  }
}
```

### 5.3 Fejlforebyggelse
Implementér proaktive strategier:
- Validér alle konfigurationsparametre før deployment
- Udfør pre-deployment tests
- Implementer automatiske rollbacks ved fejl
- Backup eksisterende deployment før opdatering
- Overvåg ressourceforbrug under deployment
- Implementer gradvis udrulning for kritiske opdateringer
