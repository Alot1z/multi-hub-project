#!/usr/bin/env node

/**
 * Multi-Hub Status Updater
 * Updates README.md with live service status and functionality percentage
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Services to monitor
const services = [
    { id: 'launcher', name: 'Launcher', icon: '🌐', url: 'https://alot1z.github.io' },
    { id: 'hub-ui', name: 'Hub UI', icon: '🎛️', url: 'https://hub-uii.netlify.app' },
    { id: 'ipa-builder', name: 'IPA Builder', icon: '📱', url: 'https://ipa-builder.netlify.app' },
    { id: 'printer-builder', name: 'Printer Builder', icon: '🖨️', url: 'https://printer-builder.netlify.app' },
    { id: 'game-builder', name: 'Game Builder', icon: '🎮', url: 'https://game-build.netlify.app' },
    { id: 'ai-models', name: 'AI Models', icon: '🤖', url: 'https://ai-modelss.netlify.app' },
    { id: 'bolt-new', name: 'Bolt.new Clone', icon: '⚡', url: 'https://bolt-new-multi-hub.netlify.app' },
    { id: 'qodo-gen', name: 'Qodo Gen', icon: '🔧', url: 'https://qodo-gen-multi-hub.netlify.app' },
    { id: 'api-gateway', name: 'API Gateway', icon: '🔗', url: 'https://api-alot1z-github-io.netlify.app' }
];

/**
 * Check if a service is online
 */
function checkService(service) {
    return new Promise((resolve) => {
        const url = new URL(service.url);
        const client = url.protocol === 'https:' ? https : http;
        
        const startTime = Date.now();
        const req = client.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'HEAD',
            timeout: 10000
        }, (res) => {
            const responseTime = Date.now() - startTime;
            const isOnline = res.statusCode >= 200 && res.statusCode < 400;
            
            resolve({
                ...service,
                status: isOnline ? 'online' : 'offline',
                statusCode: res.statusCode,
                responseTime: responseTime
            });
        });
        
        req.on('error', () => {
            resolve({
                ...service,
                status: 'offline',
                statusCode: 0,
                responseTime: 0
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({
                ...service,
                status: 'offline',
                statusCode: 0,
                responseTime: 0
            });
        });
        
        req.end();
    });
}

/**
 * Check all services
 */
async function checkAllServices() {
    console.log('🔍 Checking all Multi-Hub services...');
    
    const results = await Promise.all(services.map(checkService));
    
    const onlineCount = results.filter(r => r.status === 'online').length;
    const totalCount = results.length;
    const percentage = Math.round((onlineCount / totalCount) * 100);
    
    return {
        services: results,
        online: onlineCount,
        total: totalCount,
        percentage: percentage,
        timestamp: new Date().toISOString()
    };
}

/**
 * Generate status section for README
 */
function generateStatusSection(statusData) {
    const { services, online, total, percentage, timestamp } = statusData;
    
    // Determine overall status
    let overallStatus, statusColor;
    if (percentage === 100) {
        overallStatus = '🟢 All Systems Operational';
        statusColor = 'green';
    } else if (percentage >= 70) {
        overallStatus = '🟡 Partial Outage';
        statusColor = 'yellow';
    } else {
        overallStatus = '🔴 Major Outage';
        statusColor = 'red';
    }
    
    // Create badge URL
    const badgeUrl = `https://img.shields.io/badge/System%20Status-${percentage}%25%20Online-${statusColor}?style=for-the-badge`;
    
    // Generate service status lines
    const serviceLines = services.map(service => {
        const status = service.status === 'online' ? '🟢 Live' : '🔴 Offline';
        const responseTime = service.responseTime > 0 ? ` (${service.responseTime}ms)` : '';
        return `${service.icon} **${service.name}** • ${status}${responseTime} • [${service.url}](${service.url})`;
    }).join('  \n');
    
    // Format timestamp
    const formattedTime = new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short'
    });
    
    return `## 📊 **Live System Status**

![System Status](${badgeUrl})

**${overallStatus}** • ${online}/${total} services online (${percentage}%) • *Last updated: ${formattedTime}*

### 🎯 **Service Status:**

${serviceLines}

**📊 [View Full Status Dashboard →](https://alot1z.github.io/deploy-status)**

---

`;
}

/**
 * Update README.md with new status
 */
function updateReadme(statusSection) {
    const readmePath = path.join(__dirname, '..', 'README.md');
    
    if (!fs.existsSync(readmePath)) {
        console.error('❌ README.md not found');
        return false;
    }
    
    let content = fs.readFileSync(readmePath, 'utf8');
    
    // Remove existing status section
    content = content.replace(/## 📊 \*\*Live System Status\*\*[\s\S]*?^---$/gm, '');
    
    // Find insertion point (before Live Platforms section)
    const insertionPoint = content.indexOf('## 🚀 **Live Platforms**');
    
    if (insertionPoint !== -1) {
        // Insert before Live Platforms
        content = content.slice(0, insertionPoint) + statusSection + content.slice(insertionPoint);
    } else {
        // Insert after first --- separator
        const firstSeparator = content.indexOf('\n---\n');
        if (firstSeparator !== -1) {
            const insertPos = firstSeparator + 5; // After \n---\n
            content = content.slice(0, insertPos) + '\n' + statusSection + content.slice(insertPos);
        }
    }
    
    // Write updated content
    fs.writeFileSync(readmePath, content);
    console.log('✅ README.md updated with live status');
    return true;
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🚀 Multi-Hub Status Updater Starting...');
        
        // Check all services
        const statusData = await checkAllServices();
        
        // Generate status section
        const statusSection = generateStatusSection(statusData);
        
        // Update README
        const success = updateReadme(statusSection);
        
        if (success) {
            console.log('🎉 Status Update Complete!');
            console.log(`📊 System Health: ${statusData.percentage}% (${statusData.online}/${statusData.total} online)`);
            console.log(`⏰ Updated: ${new Date(statusData.timestamp).toLocaleString()}`);
        } else {
            console.error('❌ Failed to update README.md');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Error updating status:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { checkAllServices, generateStatusSection, updateReadme };
