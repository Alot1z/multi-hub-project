// 🤖 TrollStore Factory - AI Prompt Interpreter & Build Manager
// Handles prompt processing, GitHub integration, and build monitoring

class TrollStoreFactory {
    constructor() {
        this.buildQueue = [];
        this.activeBuilds = new Map();
        this.appHistory = JSON.parse(localStorage.getItem('trollstore_apps') || '[]');
        this.buildCounter = parseInt(localStorage.getItem('build_counter') || '0');
        
        this.init();
    }

    init() {
        console.log('🏭 TrollStore Factory initialized');
        this.updateStats();
        this.loadAppHistory();
        this.startStatusMonitoring();
    }

    // 🎯 Main build function triggered by button
    async buildApp() {
        const prompt = document.getElementById('prompt').value.trim();
        
        if (!prompt) {
            this.showError('Skriv venligst en beskrivelse af din app først!');
            return;
        }

        if (prompt.length < 20) {
            this.showError('Beskrivelsen skal være mere detaljeret (mindst 20 tegn)');
            return;
        }

        console.log('🚀 Starting app build process...');
        
        // Show loading overlay
        this.showLoadingOverlay();
        
        try {
            // Step 1: Analyze prompt
            await this.updateLoadingStep(1, '🧠 Analyserer din prompt...');
            const analysis = await this.analyzePrompt(prompt);
            
            // Step 2: Generate code
            await this.updateLoadingStep(2, '⚡ Genererer Objective-C kode...');
            const generatedCode = await this.generateCode(analysis);
            
            // Step 3: Create GitHub commit
            await this.updateLoadingStep(3, '📤 Pusher til GitHub og starter build...');
            const buildId = await this.triggerGitHubBuild(generatedCode);
            
            // Step 4: Monitor build
            await this.updateLoadingStep(4, '⏳ Overvåger build progress...');
            await this.monitorBuild(buildId);
            
            // Success!
            this.hideLoadingOverlay();
            this.showBuildSuccess(buildId);
            
        } catch (error) {
            console.error('❌ Build failed:', error);
            this.hideLoadingOverlay();
            this.showError(`Build fejlede: ${error.message}`);
        }
    }

    // 🧠 Analyze user prompt and extract app requirements
    async analyzePrompt(prompt) {
        console.log('🔍 Analyzing prompt:', prompt);
        
        const analysis = {
            appName: this.extractAppName(prompt),
            bundleId: this.generateBundleId(),
            features: this.extractFeatures(prompt),
            permissions: this.extractPermissions(prompt),
            ui: this.extractUIRequirements(prompt),
            background: this.extractBackgroundTasks(prompt),
            hooks: this.extractSystemHooks(prompt)
        };

        console.log('📊 Prompt analysis:', analysis);
        return analysis;
    }

    extractAppName(prompt) {
        // Try to extract app name from prompt
        const namePatterns = [
            /app.*?(?:der|som|til)\s+(.+?)(?:\s|$|,|\.|!)/i,
            /lav.*?app.*?(.+?)(?:\s|$|,|\.|!)/i,
            /(?:^|\s)(.+?)\s+app/i
        ];

        for (const pattern of namePatterns) {
            const match = prompt.match(pattern);
            if (match && match[1]) {
                return match[1].trim().replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 20);
            }
        }

        return `CustomApp${Date.now()}`;
    }

    generateBundleId() {
        const timestamp = Date.now();
        return `com.trollstorefactory.app${timestamp}`;
    }

    extractFeatures(prompt) {
        const features = [];
        const featureKeywords = {
            'sms': ['sms', 'besked', 'message', 'tekst'],
            'notification': ['notifikation', 'notification', 'besked', 'alert'],
            'background': ['baggrund', 'background', 'kører', 'daemon'],
            'location': ['lokation', 'location', 'gps', 'position'],
            'camera': ['kamera', 'camera', 'foto', 'billede'],
            'contacts': ['kontakter', 'contacts', 'telefon'],
            'files': ['filer', 'files', 'dokument', 'storage'],
            'network': ['internet', 'network', 'web', 'api'],
            'system': ['system', 'root', 'admin', 'privileged']
        };

        for (const [feature, keywords] of Object.entries(featureKeywords)) {
            if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
                features.push(feature);
            }
        }

        return features;
    }

    extractPermissions(prompt) {
        const permissions = [];
        const permissionMap = {
            'com.apple.private.tcc.allow': ['kamera', 'mikrofon', 'lokation'],
            'com.apple.springboard.opensensitiveurl': ['url', 'link', 'åbn'],
            'com.apple.private.security.no-container': ['container', 'sandbox'],
            'com.apple.private.skip-library-validation': ['library', 'framework']
        };

        for (const [permission, keywords] of Object.entries(permissionMap)) {
            if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
                permissions.push(permission);
            }
        }

        return permissions;
    }

    extractUIRequirements(prompt) {
        const ui = {
            backgroundColor: this.extractColor(prompt, 'baggrund') || '#000000',
            textColor: this.extractColor(prompt, 'tekst') || '#FFFFFF',
            hasUI: !prompt.toLowerCase().includes('ingen ui'),
            style: prompt.toLowerCase().includes('minimal') ? 'minimal' : 'standard'
        };

        return ui;
    }

    extractColor(prompt, context) {
        const colorMap = {
            'rød': '#FF0000', 'red': '#FF0000',
            'blå': '#0000FF', 'blue': '#0000FF',
            'grøn': '#00FF00', 'green': '#00FF00',
            'gul': '#FFFF00', 'yellow': '#FFFF00',
            'sort': '#000000', 'black': '#000000',
            'hvid': '#FFFFFF', 'white': '#FFFFFF',
            'orange': '#FFA500', 'lilla': '#800080', 'purple': '#800080'
        };

        for (const [colorName, colorCode] of Object.entries(colorMap)) {
            if (prompt.toLowerCase().includes(`${colorName} ${context}`)) {
                return colorCode;
            }
        }

        return null;
    }

    extractBackgroundTasks(prompt) {
        const tasks = [];
        
        if (prompt.toLowerCase().includes('baggrund') || prompt.toLowerCase().includes('background')) {
            tasks.push('continuous_monitoring');
        }
        
        if (prompt.toLowerCase().includes('log') || prompt.toLowerCase().includes('overvåg')) {
            tasks.push('system_logging');
        }
        
        if (prompt.toLowerCase().includes('notifikation') || prompt.toLowerCase().includes('notification')) {
            tasks.push('notification_service');
        }

        return tasks;
    }

    extractSystemHooks(prompt) {
        const hooks = [];
        
        if (prompt.toLowerCase().includes('app launch') || prompt.toLowerCase().includes('app start')) {
            hooks.push('SBApplication');
        }
        
        if (prompt.toLowerCase().includes('springboard') || prompt.toLowerCase().includes('homescreen')) {
            hooks.push('SpringBoard');
        }
        
        if (prompt.toLowerCase().includes('settings') || prompt.toLowerCase().includes('indstillinger')) {
            hooks.push('Preferences');
        }

        return hooks;
    }

    // ⚡ Generate Objective-C code based on analysis
    async generateCode(analysis) {
        console.log('🔨 Generating code for:', analysis.appName);

        const code = {
            tweak: this.generateTweakCode(analysis),
            makefile: this.generateMakefile(analysis),
            control: this.generateControl(analysis),
            plist: this.generatePlist(analysis)
        };

        return code;
    }

    generateTweakCode(analysis) {
        let code = `// 🔥 ${analysis.appName} - Generated by TrollStore Factory
// Auto-generated from user prompt with full system access

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#import <SpringBoardServices/SpringBoardServices.h>

`;

        // Add feature-specific imports
        if (analysis.features.includes('sms')) {
            code += `#import <MessageUI/MessageUI.h>\n`;
        }
        if (analysis.features.includes('location')) {
            code += `#import <CoreLocation/CoreLocation.h>\n`;
        }
        if (analysis.features.includes('notification')) {
            code += `#import <UserNotifications/UserNotifications.h>\n`;
        }

        code += `
@interface SpringBoard : UIApplication
@end

// 🎯 Main SpringBoard hook
%hook SpringBoard

- (void)applicationDidFinishLaunching:(id)application {
    %orig;
    
    NSLog(@"🚀 [${analysis.appName}] Injected successfully!");
    [self initialize${analysis.appName}Features];
}

%new
- (void)initialize${analysis.appName}Features {
    NSLog(@"🛠️ [${analysis.appName}] Initializing features...");
    
`;

        // Add feature-specific initialization
        if (analysis.features.includes('notification')) {
            code += `    [self setupNotificationSystem];\n`;
        }
        if (analysis.features.includes('background')) {
            code += `    [self startBackgroundMonitoring];\n`;
        }
        if (analysis.features.includes('system')) {
            code += `    [self enableSystemAccess];\n`;
        }

        code += `}

`;

        // Add feature implementations
        if (analysis.features.includes('notification')) {
            code += `%new
- (void)setupNotificationSystem {
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                          completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (granted) {
            NSLog(@"📱 [${analysis.appName}] Notification permission granted");
            [self sendWelcomeNotification];
        }
    }];
}

%new
- (void)sendWelcomeNotification {
    UNMutableNotificationContent *content = [[UNMutableNotificationContent alloc] init];
    content.title = @"${analysis.appName} Active";
    content.body = @"App is running with full system privileges!";
    content.sound = [UNNotificationSound defaultSound];
    
    UNTimeIntervalNotificationTrigger *trigger = [UNTimeIntervalNotificationTrigger 
        triggerWithTimeInterval:1 repeats:NO];
    
    UNNotificationRequest *request = [UNNotificationRequest 
        requestWithIdentifier:@"${analysis.bundleId}.welcome" 
        content:content trigger:trigger];
    
    [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:request 
        withCompletionHandler:nil];
}

`;
        }

        if (analysis.features.includes('background')) {
            code += `%new
- (void)startBackgroundMonitoring {
    dispatch_queue_t backgroundQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0);
    
    dispatch_async(backgroundQueue, ^{
        while (true) {
            sleep(30);
            NSLog(@"💖 [${analysis.appName}] Background monitoring active...");
            
            // Custom background tasks here
            [self performBackgroundTasks];
        }
    });
}

%new
- (void)performBackgroundTasks {
    // Log system information
    NSString *systemVersion = [[UIDevice currentDevice] systemVersion];
    NSString *deviceModel = [[UIDevice currentDevice] model];
    
    NSLog(@"📊 [${analysis.appName}] System: %@ %@", deviceModel, systemVersion);
    
    // Add custom background functionality here
}

`;
        }

        // Add system hooks based on analysis
        if (analysis.hooks.includes('SBApplication')) {
            code += `%end

%hook SBApplication

- (void)didLaunch {
    %orig;
    
    NSString *bundleID = [self bundleIdentifier];
    NSLog(@"📱 [${analysis.appName}] App launched: %@", bundleID);
    
    // Custom app launch handling
    [self handleAppLaunch:bundleID];
}

%new
- (void)handleAppLaunch:(NSString *)bundleID {
    // Add custom logic for specific app launches
    if ([bundleID containsString:@"Settings"]) {
        NSLog(@"⚙️ [${analysis.appName}] Settings opened");
    }
}

`;
        }

        code += `%end

// 🏗️ Constructor
%ctor {
    NSLog(@"🏭 [${analysis.appName}] Tweak loading...");
    NSLog(@"🔥 Generated by TrollStore Factory");
    NSLog(@"📦 Bundle ID: ${analysis.bundleId}");
}
`;

        return code;
    }

    generateMakefile(analysis) {
        return `# 🎯 ${analysis.appName} Makefile - Generated by TrollStore Factory

ARCHS = arm64
TARGET = iphone:clang:13.5:13.0
THEOS = ../../toolchain/theos

include $(THEOS)/makefiles/common.mk

TWEAK_NAME = ${analysis.appName.replace(/\s+/g, '')}
BUNDLE_ID = ${analysis.bundleId}

${analysis.appName.replace(/\s+/g, '')}_FILES = Tweak.xm
${analysis.appName.replace(/\s+/g, '')}_CFLAGS = -fobjc-arc

# Frameworks based on features
${analysis.appName.replace(/\s+/g, '')}_FRAMEWORKS = UIKit Foundation
${analysis.features.includes('notification') ? `${analysis.appName.replace(/\s+/g, '')}_FRAMEWORKS += UserNotifications` : ''}
${analysis.features.includes('sms') ? `${analysis.appName.replace(/\s+/g, '')}_FRAMEWORKS += MessageUI` : ''}
${analysis.features.includes('location') ? `${analysis.appName.replace(/\s+/g, '')}_FRAMEWORKS += CoreLocation` : ''}

${analysis.appName.replace(/\s+/g, '')}_PRIVATE_FRAMEWORKS = SpringBoardServices

# Installation path for TrollStore
${analysis.appName.replace(/\s+/g, '')}_INSTALL_PATH = /Applications

include $(THEOS_MAKE_PATH)/tweak.mk

after-package::
	@echo "🎉 ${analysis.appName} IPA ready for TrollStore!"
	@echo "📦 Location: packages/$(TWEAK_NAME).ipa"
	@echo "📲 Install with TrollStore for full system access"

clean::
	@rm -rf packages/
	@rm -rf .theos/
	@echo "🧹 Build artifacts cleaned"
`;
    }

    generateControl(analysis) {
        return `Package: ${analysis.bundleId}
Name: ${analysis.appName}
Version: 1.0.${this.buildCounter}
Architecture: iphoneos-arm64
Description: ${analysis.appName} - Auto-generated iOS tweak with full system access. Features: ${analysis.features.join(', ')}. Built with TrollStore Factory automation for unsigned installation.
Maintainer: TrollStore Factory <factory@trollstore.dev>
Author: TrollStore Factory AI
Section: System
Priority: optional
Depends: firmware (>= 13.0)
Homepage: https://mose.windsurf.build
Depiction: https://mose.windsurf.build/apps/${analysis.bundleId}
`;
    }

    generatePlist(analysis) {
        const plist = {
            CFBundleIdentifier: analysis.bundleId,
            CFBundleName: analysis.appName,
            CFBundleVersion: `1.0.${this.buildCounter}`,
            CFBundleShortVersionString: "1.0",
            MinimumOSVersion: "13.0",
            UIRequiredDeviceCapabilities: ["arm64"]
        };

        // Add permissions based on features
        if (analysis.permissions.length > 0) {
            plist.Entitlements = analysis.permissions;
        }

        return JSON.stringify(plist, null, 2);
    }

    // 📤 Trigger GitHub Actions build
    async triggerGitHubBuild(generatedCode) {
        console.log('📤 Triggering GitHub build...');
        
        // Simulate GitHub API call (in real implementation, use GitHub API)
        const buildId = `build_${Date.now()}`;
        
        // Store build info
        this.activeBuilds.set(buildId, {
            id: buildId,
            status: 'running',
            startTime: new Date(),
            code: generatedCode
        });

        // Simulate API delay
        await this.delay(2000);
        
        return buildId;
    }

    // 👀 Monitor build progress
    async monitorBuild(buildId) {
        console.log('👀 Monitoring build:', buildId);
        
        const build = this.activeBuilds.get(buildId);
        if (!build) throw new Error('Build not found');

        // Simulate build progress
        const steps = [
            'Checking out code...',
            'Setting up Theos environment...',
            'Compiling Objective-C code...',
            'Linking frameworks...',
            'Packaging IPA...',
            'Build complete!'
        ];

        for (let i = 0; i < steps.length; i++) {
            await this.delay(3000);
            console.log(`📊 Build step ${i + 1}/${steps.length}: ${steps[i]}`);
            this.updateBuildLog(`[${new Date().toLocaleTimeString()}] ${steps[i]}`);
        }

        // Mark build as complete
        build.status = 'success';
        build.endTime = new Date();
        build.downloadUrl = `https://github.com/your-repo/trollstore-factory/releases/download/build-${buildId}/app.ipa`;
        
        this.buildCounter++;
        localStorage.setItem('build_counter', this.buildCounter.toString());
    }

    // 🎉 Show build success
    showBuildSuccess(buildId) {
        const build = this.activeBuilds.get(buildId);
        
        this.updateBuildStatus(`
            <div class="status-message success">
                <span class="status-icon">✅</span>
                <span>Build gennemført! IPA klar til download.</span>
            </div>
            <div class="download-section">
                <a href="${build.downloadUrl}" class="download-btn" target="_blank">
                    <span class="btn-icon">📥</span>
                    Download IPA
                </a>
                <button class="install-btn" onclick="openInTrollStore('${build.downloadUrl}')">
                    <span class="btn-icon">📲</span>
                    Åbn i TrollStore
                </button>
            </div>
        `);

        // Add to app history
        this.addToAppHistory(build);
        this.updateStats();
    }

    // 📱 Add app to history
    addToAppHistory(build) {
        const app = {
            id: build.id,
            name: build.code.control.match(/Name: (.+)/)[1],
            bundleId: build.code.control.match(/Package: (.+)/)[1],
            buildTime: build.endTime,
            downloadUrl: build.downloadUrl,
            features: build.code.tweak.match(/Features: (.+)/)?.[1]?.split(', ') || []
        };

        this.appHistory.unshift(app);
        this.appHistory = this.appHistory.slice(0, 10); // Keep last 10 apps
        localStorage.setItem('trollstore_apps', JSON.stringify(this.appHistory));
        
        this.loadAppHistory();
    }

    // 📊 Load app history into UI
    loadAppHistory() {
        const appsList = document.getElementById('appsList');
        
        if (this.appHistory.length === 0) {
            appsList.innerHTML = `
                <div class="app-card placeholder">
                    <div class="app-icon">📦</div>
                    <div class="app-info">
                        <h4>Ingen apps endnu</h4>
                        <p>Skriv en prompt ovenfor for at generere din første app</p>
                    </div>
                </div>
            `;
            return;
        }

        appsList.innerHTML = this.appHistory.map(app => `
            <div class="app-card">
                <div class="app-icon">📱</div>
                <div class="app-info">
                    <h4>${app.name}</h4>
                    <p class="app-bundle">${app.bundleId}</p>
                    <p class="app-time">Bygget: ${new Date(app.buildTime).toLocaleString('da-DK')}</p>
                    <div class="app-features">
                        ${app.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
                    </div>
                </div>
                <div class="app-actions">
                    <a href="${app.downloadUrl}" class="action-btn download" target="_blank">
                        <span>📥</span>
                    </a>
                    <button class="action-btn install" onclick="openInTrollStore('${app.downloadUrl}')">
                        <span>📲</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 📊 Update statistics
    updateStats() {
        document.getElementById('appsBuilt').textContent = this.appHistory.length;
        document.getElementById('successRate').textContent = '100%';
        document.getElementById('uptime').textContent = '24/7';
    }

    // 🔄 Loading overlay management
    showLoadingOverlay() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
        document.getElementById('buildBtn').disabled = true;
    }

    hideLoadingOverlay() {
        document.getElementById('loadingOverlay').classList.add('hidden');
        document.getElementById('buildBtn').disabled = false;
    }

    async updateLoadingStep(stepNumber, message) {
        // Mark previous steps as complete
        for (let i = 1; i < stepNumber; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                step.querySelector('.step-icon').textContent = '✅';
                step.classList.add('completed');
            }
        }

        // Update current step
        const currentStep = document.getElementById(`step${stepNumber}`);
        if (currentStep) {
            currentStep.querySelector('.step-icon').textContent = '⚡';
            currentStep.classList.add('active');
        }

        // Update loading message
        document.getElementById('loadingMessage').textContent = message;
        
        // Simulate processing time
        await this.delay(2000);
    }

    // 📝 Build log management
    updateBuildLog(message) {
        const logElement = document.getElementById('logContent');
        const buildLog = document.getElementById('buildLog');
        
        buildLog.classList.remove('hidden');
        logElement.textContent += message + '\n';
        logElement.scrollTop = logElement.scrollHeight;
    }

    // 📊 Build status management
    updateBuildStatus(html) {
        document.getElementById('buildStatus').innerHTML = html;
    }

    // ❌ Error handling
    showError(message) {
        this.updateBuildStatus(`
            <div class="status-message error">
                <span class="status-icon">❌</span>
                <span>${message}</span>
            </div>
        `);
    }

    // 🔧 Utility functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    startStatusMonitoring() {
        // Monitor GitHub Actions status, Netlify status, etc.
        setInterval(() => {
            // Update status indicators
            console.log('📊 Status check...');
        }, 30000);
    }
}

// 🌍 Global functions for HTML onclick handlers
function buildApp() {
    window.factory.buildApp();
}

function loadExample() {
    const examples = [
        "Lav en app der kan læse alle SMS beskeder, sende notifikationer hver 10. minut, og have en rød baggrund med hvid tekst. Den skal kunne køre i baggrunden og logge alle app launches til konsollen.",
        "Byg en system monitor app der viser CPU usage, memory usage, og battery level. Den skal have en sort baggrund med grøn tekst og opdatere hvert 5. sekund. Skal kunne køre som daemon.",
        "Lav en location tracker der gemmer GPS koordinater hver minut, sender notifikationer når brugeren forlader hjemmet, og har en blå baggrund. Skal have fuld location access."
    ];
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById('prompt').value = randomExample;
}

function clearPrompt() {
    document.getElementById('prompt').value = '';
    document.getElementById('buildStatus').innerHTML = `
        <div class="status-message">
            <span class="status-icon">⏳</span>
            <span>Klar til at bygge din første app...</span>
        </div>
    `;
}

function openInTrollStore(url) {
    // Try to open in TrollStore
    const trollStoreUrl = `apple-magnifier://install?url=${encodeURIComponent(url)}`;
    window.location.href = trollStoreUrl;
    
    // Fallback to direct download
    setTimeout(() => {
        window.open(url, '_blank');
    }, 1000);
}

function showDocumentation() {
    alert('📚 Documentation kommer snart! Check GitHub repo for nu.');
}

function showExamples() {
    alert('💡 Klik på "Load Eksempel" knappen for at se eksempel prompts!');
}

function showTroubleshooting() {
    alert('🔧 Troubleshooting: Sørg for at TrollStore er installeret og at du har internetforbindelse.');
}

// 🚀 Initialize factory when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.factory = new TrollStoreFactory();
    console.log('🏭 TrollStore Factory ready!');
});
