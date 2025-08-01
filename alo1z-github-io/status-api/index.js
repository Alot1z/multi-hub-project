// 🎯 UNIFIED STATUS API - SINGLE SOURCE OF TRUTH
// This is the ONLY place that checks service status
// Both README and dashboard use this same data

const SERVICES = [
    { id: 'launcher', name: 'Launcher', url: 'https://alot1z.github.io', icon: '🌐' },
    { id: 'hub-ui', name: 'Hub UI', url: 'https://hub-uii.netlify.app', icon: '🎛️' },
    { id: 'ipa-builder', name: 'IPA Builder', url: 'https://ipa-builder.netlify.app', icon: '📱' },
    { id: 'printer-builder', name: 'Printer Builder', url: 'https://printer-builder.netlify.app', icon: '🖨️' },
    { id: 'game-builder', name: 'Game Builder', url: 'https://game-build.netlify.app', icon: '🎮' },
    { id: 'ai-models', name: 'AI Models', url: 'https://ai-modelss.netlify.app', icon: '🤖' },
    { id: 'bolt-new', name: 'Bolt.new Clone', url: 'https://bolt-new-multi-hub.netlify.app', icon: '⚡' },
    { id: 'qodo-gen', name: 'Qodo Gen', url: 'https://qodo-gen-multi-hub.netlify.app', icon: '🔧' },
    { id: 'api-gateway', name: 'API Gateway', url: 'https://api-alot1z-github-io.netlify.app', icon: '🔗' }
];

let cachedStatus = null;
let lastCheck = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache to avoid draining services

async function checkSingleService(service) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const startTime = Date.now();
        const response = await fetch(service.url, { 
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        return {
            id: service.id,
            name: service.name,
            url: service.url,
            icon: service.icon,
            status: 'online',
            responseTime: responseTime,
            lastChecked: new Date().toISOString()
        };
    } catch (error) {
        return {
            id: service.id,
            name: service.name,
            url: service.url,
            icon: service.icon,
            status: 'offline',
            responseTime: 0,
            lastChecked: new Date().toISOString(),
            error: error.message
        };
    }
}

async function getUnifiedStatus() {
    const now = Date.now();
    
    // Return cached status if still valid (avoid draining services)
    if (cachedStatus && (now - lastCheck) < CACHE_DURATION) {
        return cachedStatus;
    }
    
    console.log('🔄 Checking service status...');
    
    // Check all services in parallel (but only once every 2 minutes)
    const statusPromises = SERVICES.map(service => checkSingleService(service));
    const results = await Promise.all(statusPromises);
    
    // Calculate overall status
    const onlineServices = results.filter(r => r.status === 'online');
    const totalServices = results.length;
    const percentage = Math.round((onlineServices.length / totalServices) * 100);
    
    let overallStatus = 'offline';
    if (percentage === 100) overallStatus = 'online';
    else if (percentage >= 50) overallStatus = 'warning';
    
    const unifiedStatus = {
        overall: {
            status: overallStatus,
            percentage: percentage,
            onlineCount: onlineServices.length,
            totalCount: totalServices,
            lastUpdated: new Date().toISOString()
        },
        services: results,
        metadata: {
            checkDuration: CACHE_DURATION,
            nextCheck: new Date(now + CACHE_DURATION).toISOString()
        }
    };
    
    // Cache the result
    cachedStatus = unifiedStatus;
    lastCheck = now;
    
    console.log(`✅ Status check complete: ${percentage}% (${onlineServices.length}/${totalServices})`);
    
    return unifiedStatus;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getUnifiedStatus, SERVICES };
}

// Browser global for direct use
if (typeof window !== 'undefined') {
    window.UnifiedStatus = { getUnifiedStatus, SERVICES };
}
