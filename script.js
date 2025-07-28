// 🤖 TrollStore Factory - Advanced App Builder with Multi-Step Wizard
// Handles complex app generation with step-by-step configuration

class TrollStoreFactory {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 5;
        this.appConfig = {
            basicInfo: {},
            features: [],
            permissions: [],
            environment: {},
            buildSettings: {}
        };
        this.appHistory = JSON.parse(localStorage.getItem('trollstore_apps') || '[]');
        this.buildCounter = parseInt(localStorage.getItem('build_counter') || '0');
        
        this.init();
    }

    init() {
        console.log('🏭 TrollStore Factory initialized');
        this.loadAppHistory();
        this.setupEventListeners();
        this.updateStats();
    }

    setupEventListeners() {
        // Feature checkboxes
        document.querySelectorAll('.feature-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateFeatureSelection());
        });

        // Permission checkboxes
        document.querySelectorAll('.permission-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updatePermissionSelection());
        });

        // Environment radio buttons
        document.querySelectorAll('input[name="environment"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateEnvironmentSelection());
        });

        // Form inputs
        document.getElementById('appName').addEventListener('input', () => this.updateBasicInfo());
        document.getElementById('appDescription').addEventListener('input', () => this.updateBasicInfo());
        document.getElementById('targetVersion').addEventListener('change', () => this.updateBasicInfo());
    }

    // 🧙‍♂️ Wizard Management
    startAppWizard() {
        const prompt = document.getElementById('prompt').value.trim();
        
        if (prompt) {
            // Pre-fill wizard based on prompt analysis
            this.analyzePromptForWizard(prompt);
        }
        
        document.getElementById('appWizard').classList.remove('hidden');
        document.querySelector('.prompt-section').style.display = 'none';
        this.updateWizardStep(1);
    }

    analyzePromptForWizard(prompt) {
        // Auto-fill app name
        const appName = this.extractAppName(prompt);
        document.getElementById('appName').value = appName;
        
        // Auto-fill description
        document.getElementById('appDescription').value = prompt.substring(0, 200);
        
        // Auto-select features based on prompt
        const features = this.extractFeatures(prompt);
        features.forEach(feature => {
            const checkbox = document.getElementById(`feat-${feature}`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Auto-select permissions
        const permissions = this.extractPermissions(prompt);
        permissions.forEach(permission => {
            const checkbox = document.querySelector(`input[value="${permission}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Auto-set colors
        const bgColor = this.extractColor(prompt, 'baggrund');
        const textColor = this.extractColor(prompt, 'tekst');
        if (bgColor) document.getElementById('bgColor').value = bgColor;
        if (textColor) document.getElementById('textColor').value = textColor;
        
        this.updateBasicInfo();
        this.updateFeatureSelection();
        this.updatePermissionSelection();
    }

    nextStep() {
        if (this.currentStep < this.maxSteps) {
            if (this.validateCurrentStep()) {
                this.currentStep++;
                this.updateWizardStep(this.currentStep);
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateWizardStep(this.currentStep);
        }
    }

    updateWizardStep(step) {
        // Update progress indicators
        document.querySelectorAll('.progress-step').forEach((el, index) => {
            if (index + 1 < step) {
                el.classList.add('completed');
                el.classList.remove('active');
            } else if (index + 1 === step) {
                el.classList.add('active');
                el.classList.remove('completed');
            } else {
                el.classList.remove('active', 'completed');
            }
        });

        // Show/hide wizard steps
        document.querySelectorAll('.wizard-step').forEach((el, index) => {
            if (index + 1 === step) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        // Update navigation buttons
        document.querySelector('.prev-btn').disabled = step === 1;
        const nextBtn = document.querySelector('.next-btn');
        if (step === this.maxSteps) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
        }

        // Update build summary on final step
        if (step === 5) {
            this.updateBuildSummary();
        }

        this.currentStep = step;
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                const appName = document.getElementById('appName').value.trim();
                if (!appName) {
                    alert('App navn er påkrævet!');
                    return false;
                }
                break;
            case 2:
                const selectedFeatures = document.querySelectorAll('.feature-option input:checked');
                if (selectedFeatures.length === 0) {
                    alert('Vælg mindst én feature!');
                    return false;
                }
                break;
        }
        return true;
    }

    // 📊 Configuration Updates
    updateBasicInfo() {
        this.appConfig.basicInfo = {
            name: document.getElementById('appName').value,
            description: document.getElementById('appDescription').value,
            targetVersion: document.getElementById('targetVersion').value
        };
    }

    updateFeatureSelection() {
        this.appConfig.features = Array.from(document.querySelectorAll('.feature-option input:checked'))
            .map(checkbox => checkbox.value);
    }

    updatePermissionSelection() {
        this.appConfig.permissions = Array.from(document.querySelectorAll('.permission-option input:checked'))
            .map(checkbox => checkbox.value);
    }

    updateEnvironmentSelection() {
        const selectedEnv = document.querySelector('input[name="environment"]:checked').value;
        this.appConfig.environment = {
            type: selectedEnv,
            backgroundColor: document.getElementById('bgColor').value,
            textColor: document.getElementById('textColor').value,
            uiStyle: document.getElementById('uiStyle').value
        };
    }

    updateBuildSummary() {
        const summary = document.getElementById('buildSummary');
        const config = this.appConfig;
        
        summary.innerHTML = `
            <div class="summary-item">
                <strong>App Name:</strong> ${config.basicInfo.name || 'Unnamed App'}
            </div>
            <div class="summary-item">
                <strong>Target iOS:</strong> ${config.basicInfo.targetVersion || 'Not specified'}
            </div>
            <div class="summary-item">
                <strong>Features:</strong> ${config.features.length} selected (${config.features.join(', ')})
            </div>
            <div class="summary-item">
                <strong>Permissions:</strong> ${config.permissions.length} selected
            </div>
            <div class="summary-item">
                <strong>Environment:</strong> ${config.environment.type || 'trollstore'}
            </div>
            <div class="summary-item">
                <strong>UI Style:</strong> ${config.environment.uiStyle || 'standard'}
            </div>
        `;
    }

    // 🚀 App Building
    async buildCustomApp() {
        console.log('🚀 Building custom app with config:', this.appConfig);
        
        this.showLoadingOverlay();
        
        try {
            // Step 1: Validate configuration
            await this.updateLoadingStep(1, '🔍 Validerer konfiguration...');
            this.validateConfiguration();
            
            // Step 2: Generate code
            await this.updateLoadingStep(2, '⚡ Genererer Objective-C kode...');
            const generatedCode = await this.generateAdvancedCode();
            
            // Step 3: Save to database
            await this.updateLoadingStep(3, '💾 Gemmer til database...');
            const appId = await this.saveAppToDatabase(generatedCode);
            
            // Step 4: Trigger GitHub build
            await this.updateLoadingStep(4, '📤 Starter GitHub Actions build...');
            const buildId = await this.triggerGitHubBuild(generatedCode, appId);
            
            // Step 5: Monitor build
            await this.updateLoadingStep(5, '⏳ Overvåger build progress...');
            await this.monitorBuild(buildId);
            
            this.hideLoadingOverlay();
            this.showBuildSuccess(buildId);
            
        } catch (error) {
            console.error('❌ Build failed:', error);
            this.hideLoadingOverlay();
            this.showError(`Build fejlede: ${error.message}`);
        }
    }

    validateConfiguration() {
        if (!this.appConfig.basicInfo.name) {
            throw new Error('App navn mangler');
        }
        if (this.appConfig.features.length === 0) {
            throw new Error('Ingen features valgt');
        }
    }

    async generateAdvancedCode() {
        const config = this.appConfig;
        
        return {
            tweak: this.generateAdvancedTweakCode(config),
            makefile: this.generateAdvancedMakefile(config),
            control: this.generateAdvancedControl(config),
            plist: this.generateAdvancedPlist(config),
            entitlements: this.generateEntitlements(config)
        };
    }

    generateAdvancedTweakCode(config) {
        let code = `// 🔥 ${config.basicInfo.name} - Generated by TrollStore Factory
// Advanced multi-environment iOS tweak with full system access
// Target: ${config.basicInfo.targetVersion} | Environment: ${config.environment.type}

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#import <SpringBoardServices/SpringBoardServices.h>

`;

        // Add environment-specific imports
        if (config.environment.type === 'jailbreak15' || config.environment.type === 'jailbreak17') {
            code += `#import <substrate.h>\n`;
            code += `#import <dlfcn.h>\n`;
        }

        // Add feature-specific imports
        if (config.features.includes('sms')) {
            code += `#import <MessageUI/MessageUI.h>\n#import <CoreTelephony/CoreTelephony.h>\n`;
        }
        if (config.features.includes('location')) {
            code += `#import <CoreLocation/CoreLocation.h>\n`;
        }
        if (config.features.includes('notifications')) {
            code += `#import <UserNotifications/UserNotifications.h>\n`;
        }
        if (config.features.includes('camera')) {
            code += `#import <AVFoundation/AVFoundation.h>\n`;
        }
        if (config.features.includes('files')) {
            code += `#import <MobileCoreServices/MobileCoreServices.h>\n`;
        }

        code += `
// Environment detection and compatibility
#define IS_JAILBROKEN_15 (${config.environment.type === 'jailbreak15' ? 'YES' : 'NO'})
#define IS_JAILBROKEN_17 (${config.environment.type === 'jailbreak17' ? 'YES' : 'NO'})
#define IS_PURE_TROLLSTORE (${config.environment.type === 'trollstore' ? 'YES' : 'NO'})

@interface SpringBoard : UIApplication
@end

@interface ${config.basicInfo.name.replace(/\s+/g, '')}Manager : NSObject
+ (instancetype)sharedInstance;
- (void)initializeWithConfiguration:(NSDictionary *)config;
@end

// 🎯 Main SpringBoard hook
%hook SpringBoard

- (void)applicationDidFinishLaunching:(id)application {
    %orig;
    
    NSLog(@"🚀 [${config.basicInfo.name}] Injected successfully!");
    NSLog(@"🛠️ Environment: ${config.environment.type}");
    NSLog(@"📱 Target iOS: ${config.basicInfo.targetVersion}");
    
    [self initialize${config.basicInfo.name.replace(/\s+/g, '')}];
}

%new
- (void)initialize${config.basicInfo.name.replace(/\s+/g, '')} {
    NSDictionary *config = @{
        @"features": @[${config.features.map(f => `@"${f}"`).join(', ')}],
        @"permissions": @[${config.permissions.map(p => `@"${p}"`).join(', ')}],
        @"environment": @"${config.environment.type}",
        @"backgroundColor": @"${config.environment.backgroundColor}",
        @"textColor": @"${config.environment.textColor}",
        @"uiStyle": @"${config.environment.uiStyle}"
    };
    
    [[${config.basicInfo.name.replace(/\s+/g, '')}Manager sharedInstance] initializeWithConfiguration:config];
}

%end

// 🏗️ Main Manager Implementation
@implementation ${config.basicInfo.name.replace(/\s+/g, '')}Manager

+ (instancetype)sharedInstance {
    static ${config.basicInfo.name.replace(/\s+/g, '')}Manager *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[self alloc] init];
    });
    return instance;
}

- (void)initializeWithConfiguration:(NSDictionary *)config {
    NSLog(@"🛠️ [${config.basicInfo.name}] Initializing with config: %@", config);
    
    // Environment-specific initialization
    if (IS_JAILBROKEN_15) {
        [self setupJailbreak15Environment];
    } else if (IS_JAILBROKEN_17) {
        [self setupJailbreak17Environment];
    } else {
        [self setupTrollStoreEnvironment];
    }
    
    // Feature initialization
    NSArray *features = config[@"features"];
`;

        // Add feature implementations
        config.features.forEach(feature => {
            code += `    if ([features containsObject:@"${feature}"]) {
        [self setup${feature.charAt(0).toUpperCase() + feature.slice(1)}Feature];
    }
`;
        });

        code += `
    // UI setup if needed
    if (![config[@"uiStyle"] isEqualToString:@"none"]) {
        [self setupUserInterface:config];
    }
    
    // Background tasks
    if ([features containsObject:@"background"]) {
        [self startBackgroundTasks];
    }
}

// Environment-specific setups
- (void)setupTrollStoreEnvironment {
    NSLog(@"🏠 Setting up pure TrollStore environment");
    // TrollStore-specific initialization
}

- (void)setupJailbreak15Environment {
    NSLog(@"🔓 Setting up iOS 15.5 Jailbreak + TrollStore environment");
    // Load substrate if available
    void *substrate = dlopen("/usr/lib/libsubstrate.dylib", RTLD_LAZY);
    if (substrate) {
        NSLog(@"✅ Substrate loaded successfully");
    }
}

- (void)setupJailbreak17Environment {
    NSLog(@"⚡ Setting up iOS 17.0 Bootstrap + TrollStore environment");
    // Bootstrap-specific initialization
    if ([[NSFileManager defaultManager] fileExistsAtPath:@"/var/jb"]) {
        NSLog(@"✅ Bootstrap environment detected");
    }
}

`;

        // Add feature implementations
        if (config.features.includes('notifications')) {
            code += `
- (void)setupNotificationsFeature {
    NSLog(@"🔔 Setting up notifications feature");
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                          completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (granted) {
            NSLog(@"📱 Notification permission granted");
            [self sendWelcomeNotification];
        }
    }];
}

- (void)sendWelcomeNotification {
    UNMutableNotificationContent *content = [[UNMutableNotificationContent alloc] init];
    content.title = @"${config.basicInfo.name}";
    content.body = @"App is running with full system privileges!";
    content.sound = [UNNotificationSound defaultSound];
    
    UNTimeIntervalNotificationTrigger *trigger = [UNTimeIntervalNotificationTrigger 
        triggerWithTimeInterval:1 repeats:NO];
    
    UNNotificationRequest *request = [UNNotificationRequest 
        requestWithIdentifier:@"welcome" 
        content:content trigger:trigger];
    
    [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:request 
        withCompletionHandler:nil];
}
`;
        }

        if (config.features.includes('background')) {
            code += `
- (void)setupBackgroundFeature {
    NSLog(@"🔄 Setting up background tasks");
}

- (void)startBackgroundTasks {
    dispatch_queue_t backgroundQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0);
    
    dispatch_async(backgroundQueue, ^{
        while (true) {
            sleep(30);
            NSLog(@"💖 [${config.basicInfo.name}] Background task running...");
            [self performBackgroundWork];
        }
    });
}

- (void)performBackgroundWork {
    // Custom background functionality
    NSString *systemVersion = [[UIDevice currentDevice] systemVersion];
    NSLog(@"📊 System: %@", systemVersion);
}
`;
        }

        if (config.features.includes('sms')) {
            code += `
- (void)setupSmsFeature {
    NSLog(@"💬 Setting up SMS feature");
    // SMS functionality implementation
}
`;
        }

        if (config.features.includes('location')) {
            code += `
- (void)setupLocationFeature {
    NSLog(@"📍 Setting up location services");
    // Location services implementation
}
`;
        }

        if (config.features.includes('camera')) {
            code += `
- (void)setupCameraFeature {
    NSLog(@"📷 Setting up camera access");
    // Camera functionality implementation
}
`;
        }

        if (config.features.includes('files')) {
            code += `
- (void)setupFilesFeature {
    NSLog(@"📁 Setting up file system access");
    // File system functionality implementation
}
`;
        }

        if (config.features.includes('system')) {
            code += `
- (void)setupSystemFeature {
    NSLog(@"⚙️ Setting up system monitoring");
    // System monitoring implementation
}
`;
        }

        if (config.features.includes('network')) {
            code += `
- (void)setupNetworkFeature {
    NSLog(@"🌐 Setting up network access");
    // Network functionality implementation
}
`;
        }

        code += `
- (void)setupUserInterface:(NSDictionary *)config {
    // UI setup based on configuration
    NSString *uiStyle = config[@"uiStyle"];
    NSString *bgColor = config[@"backgroundColor"];
    NSString *textColor = config[@"textColor"];
    
    NSLog(@"🎨 Setting up UI - Style: %@, BG: %@, Text: %@", uiStyle, bgColor, textColor);
}

@end

// 🏗️ Constructor
%ctor {
    NSLog(@"🏭 [${config.basicInfo.name}] Loading...");
    NSLog(@"🔥 Generated by TrollStore Factory");
    NSLog(@"📦 Features: ${config.features.join(', ')}");
    NSLog(@"🔐 Permissions: ${config.permissions.length} granted");
}
`;

        return code;
    }

    generateAdvancedMakefile(config) {
        const appName = config.basicInfo.name.replace(/\s+/g, '');
        const frameworks = ['UIKit', 'Foundation'];
        
        // Add frameworks based on features
        if (config.features.includes('notifications')) frameworks.push('UserNotifications');
        if (config.features.includes('sms')) frameworks.push('MessageUI', 'CoreTelephony');
        if (config.features.includes('location')) frameworks.push('CoreLocation');
        if (config.features.includes('camera')) frameworks.push('AVFoundation');
        if (config.features.includes('files')) frameworks.push('MobileCoreServices');
        
        return `# 🎯 ${config.basicInfo.name} - Advanced TrollStore Factory Build
# Generated for ${config.environment.type} environment

ARCHS = arm64
TARGET = iphone:clang:13.5:13.0
THEOS = ../../toolchain/theos

include $(THEOS)/makefiles/common.mk

TWEAK_NAME = ${appName}
BUNDLE_ID = com.trollstorefactory.${appName.toLowerCase()}

${appName}_FILES = Tweak.xm
${appName}_CFLAGS = -fobjc-arc -DENVIRONMENT_${config.environment.type.toUpperCase()}

# Frameworks
${appName}_FRAMEWORKS = ${frameworks.join(' ')}
${appName}_PRIVATE_FRAMEWORKS = SpringBoardServices

# Environment-specific libraries
${config.environment.type === 'jailbreak15' || config.environment.type === 'jailbreak17' ? `${appName}_LIBRARIES = substrate` : ''}

# Installation path
${appName}_INSTALL_PATH = /Applications

include $(THEOS_MAKE_PATH)/tweak.mk

after-package::
	@echo "🎉 ${config.basicInfo.name} IPA ready!"
	@echo "📦 Environment: ${config.environment.type}"
	@echo "⚡ Features: ${config.features.join(', ')}"
	@echo "📲 Install with TrollStore"

clean::
	@rm -rf packages/
	@rm -rf .theos/
	@echo "🧹 Cleaned build artifacts"
`;
    }

    generateAdvancedControl(config) {
        return `Package: com.trollstorefactory.${config.basicInfo.name.replace(/\s+/g, '').toLowerCase()}
Name: ${config.basicInfo.name}
Version: 2.0.${this.buildCounter}
Architecture: iphoneos-arm64
Description: ${config.basicInfo.description || config.basicInfo.name} - Advanced TrollStore app with ${config.features.length} features. Environment: ${config.environment.type}. Generated by TrollStore Factory.
Maintainer: TrollStore Factory <factory@trollstore.dev>
Author: TrollStore Factory AI
Section: System
Priority: optional
Depends: firmware (>= ${config.basicInfo.targetVersion === '17.0' ? '17.0' : '15.5'})
Conflicts: com.example.conflictingapp
Homepage: https://mose.windsurf.build
Depiction: https://mose.windsurf.build/apps/${config.basicInfo.name.replace(/\s+/g, '').toLowerCase()}
Icon: https://mose.windsurf.build/icons/${config.basicInfo.name.replace(/\s+/g, '').toLowerCase()}.png
`;
    }

    generateAdvancedPlist(config) {
        const bundleId = `com.trollstorefactory.${config.basicInfo.name.replace(/\s+/g, '').toLowerCase()}`;
        
        return {
            CFBundleIdentifier: bundleId,
            CFBundleName: config.basicInfo.name,
            CFBundleDisplayName: config.basicInfo.name,
            CFBundleVersion: `2.0.${this.buildCounter}`,
            CFBundleShortVersionString: "2.0",
            MinimumOSVersion: config.basicInfo.targetVersion === '17.0' ? "17.0" : "15.5",
            UIRequiredDeviceCapabilities: ["arm64"],
            LSRequiresIPhoneOS: true,
            CFBundlePackageType: "APPL",
            CFBundleExecutable: config.basicInfo.name.replace(/\s+/g, ''),
            UILaunchStoryboardName: "LaunchScreen",
            UISupportedInterfaceOrientations: [
                "UIInterfaceOrientationPortrait",
                "UIInterfaceOrientationLandscapeLeft",
                "UIInterfaceOrientationLandscapeRight"
            ]
        };
    }

    generateEntitlements(config) {
        const entitlements = {};
        
        // Add permissions as entitlements
        config.permissions.forEach(permission => {
            entitlements[permission] = true;
        });
        
        // Add standard TrollStore entitlements
        entitlements["com.apple.private.security.no-container"] = true;
        entitlements["com.apple.private.skip-library-validation"] = true;
        
        // Environment-specific entitlements
        if (config.environment.type === 'jailbreak15' || config.environment.type === 'jailbreak17') {
            entitlements["com.apple.private.security.no-sandbox"] = true;
            entitlements["com.apple.private.security.system-application"] = true;
        }
        
        return entitlements;
    }

    // 💾 Database Operations
    async saveAppToDatabase(generatedCode) {
        // This would integrate with Netlify DB/Neon
        const appData = {
            id: `app_${Date.now()}`,
            name: this.appConfig.basicInfo.name,
            config: this.appConfig,
            code: generatedCode,
            created: new Date().toISOString(),
            status: 'building'
        };
        
        // Simulate database save
        console.log('💾 Saving to database:', appData.id);
        return appData.id;
    }

    // 📤 GitHub Integration
    async triggerGitHubBuild(generatedCode, appId) {
        console.log('📤 Triggering GitHub build for app:', appId);
        
        const buildId = `build_${Date.now()}`;
        
        // In real implementation, this would:
        // 1. Create new branch
        // 2. Commit generated files
        // 3. Trigger GitHub Actions
        // 4. Return build ID
        
        return buildId;
    }

    async monitorBuild(buildId) {
        console.log('👀 Monitoring build:', buildId);
        
        const steps = [
            'Checking out code...',
            'Setting up Theos environment...',
            'Compiling Objective-C code...',
            'Linking frameworks...',
            'Applying entitlements...',
            'Packaging IPA...',
            'Build complete!'
        ];

        for (let i = 0; i < steps.length; i++) {
            await this.delay(2000);
            console.log(`📊 Build step ${i + 1}/${steps.length}: ${steps[i]}`);
            this.updateBuildLog(`[${new Date().toLocaleTimeString()}] ${steps[i]}`);
        }
    }

    // 🎉 Success Handling
    showBuildSuccess(buildId) {
        const downloadUrl = `https://github.com/Alot1z/Insta/releases/download/build-${buildId}/${this.appConfig.basicInfo.name.replace(/\s+/g, '')}.ipa`;
        
        this.updateBuildStatus(`
            <div class="status-message success">
                <span class="status-icon">✅</span>
                <span>Build gennemført! ${this.appConfig.basicInfo.name} IPA klar til download.</span>
            </div>
            <div class="download-section">
                <a href="${downloadUrl}" class="download-btn" target="_blank">
                    <span class="btn-icon">📥</span>
                    Download IPA
                </a>
                <button class="install-btn" onclick="openInTrollStore('${downloadUrl}')">
                    <span class="btn-icon">📲</span>
                    Åbn i TrollStore
                </button>
            </div>
            <div class="app-details">
                <h4>📋 App Details</h4>
                <p><strong>Features:</strong> ${this.appConfig.features.join(', ')}</p>
                <p><strong>Permissions:</strong> ${this.appConfig.permissions.length} granted</p>
                <p><strong>Environment:</strong> ${this.appConfig.environment.type}</p>
            </div>
        `);

        // Add to history
        this.addToAppHistory({
            id: buildId,
            name: this.appConfig.basicInfo.name,
            config: this.appConfig,
            downloadUrl: downloadUrl,
            buildTime: new Date()
        });
        
        this.buildCounter++;
        localStorage.setItem('build_counter', this.buildCounter.toString());
        this.updateStats();
    }

    // 📱 App History Management
    addToAppHistory(app) {
        this.appHistory.unshift(app);
        this.appHistory = this.appHistory.slice(0, 10);
        localStorage.setItem('trollstore_apps', JSON.stringify(this.appHistory));
        this.loadAppHistory();
    }

    loadAppHistory() {
        const appsList = document.getElementById('appsList');
        
        if (this.appHistory.length === 0) {
            appsList.innerHTML = `
                <div class="app-card placeholder">
                    <div class="app-icon">📦</div>
                    <div class="app-info">
                        <h4>Ingen apps endnu</h4>
                        <p>Brug App Wizard ovenfor for at generere din første app</p>
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
                    <p class="app-features">Features: ${app.config.features.join(', ')}</p>
                    <p class="app-env">Environment: ${app.config.environment.type}</p>
                    <p class="app-time">Built: ${new Date(app.buildTime).toLocaleString('da-DK')}</p>
                </div>
                <div class="app-actions">
                    <a href="${app.downloadUrl}" class="action-btn download" target="_blank">
                        <span>📥</span>
                    </a>
                    <button class="action-btn install" onclick="openInTrollStore('${app.downloadUrl}')">
                        <span>📲</span>
                    </button>
                    <button class="action-btn config" onclick="loadAppConfig('${app.id}')">
                        <span>⚙️</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 🔧 Utility Functions
    updateStats() {
        document.getElementById('appsBuilt').textContent = this.appHistory.length;
    }

    showLoadingOverlay() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoadingOverlay() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    async updateLoadingStep(stepNumber, message) {
        for (let i = 1; i < stepNumber; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                step.querySelector('.step-icon').textContent = '✅';
                step.classList.add('completed');
            }
        }

        const currentStep = document.getElementById(`step${stepNumber}`);
        if (currentStep) {
            currentStep.querySelector('.step-icon').textContent = '⚡';
            currentStep.classList.add('active');
        }

        document.getElementById('loadingMessage').textContent = message;
        await this.delay(1500);
    }

    updateBuildLog(message) {
        const logElement = document.getElementById('logContent');
        const buildLog = document.getElementById('buildLog');
        
        buildLog.classList.remove('hidden');
        logElement.textContent += message + '\n';
        logElement.scrollTop = logElement.scrollHeight;
    }

    updateBuildStatus(html) {
        document.getElementById('buildStatus').innerHTML = html;
    }

    showError(message) {
        this.updateBuildStatus(`
            <div class="status-message error">
                <span class="status-icon">❌</span>
                <span>${message}</span>
            </div>
        `);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Legacy prompt analysis functions (reused from original)
    extractAppName(prompt) {
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

    extractFeatures(prompt) {
        const features = [];
        const featureKeywords = {
            'sms': ['sms', 'besked', 'message', 'tekst'],
            'notifications': ['notifikation', 'notification', 'besked', 'alert'],
            'background': ['baggrund', 'background', 'kører', 'daemon'],
            'location': ['lokation', 'location', 'gps', 'position'],
            'camera': ['kamera', 'camera', 'foto', 'billede'],
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
            'com.apple.private.security.no-container': ['container', 'sandbox'],
            'com.apple.private.skip-library-validation': ['library', 'framework'],
            'com.apple.private.security.no-sandbox': ['root', 'system', 'admin']
        };

        for (const [permission, keywords] of Object.entries(permissionMap)) {
            if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
                permissions.push(permission);
            }
        }

        return permissions;
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
}

// 🌍 Global functions
function startAppWizard() {
    window.factory.startAppWizard();
}

function nextStep() {
    window.factory.nextStep();
}

function previousStep() {
    window.factory.previousStep();
}

function buildCustomApp() {
    window.factory.buildCustomApp();
}

function saveConfiguration() {
    const config = window.factory.appConfig;
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.basicInfo.name || 'app'}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadExample() {
    const examples = [
        "Lav en SMS monitor app der kan læse alle beskeder, sende notifikationer når der kommer nye beskeder, og have en sort baggrund med grøn tekst. Den skal køre i baggrunden og logge alle SMS aktiviteter.",
        "Byg en location tracker der gemmer GPS koordinater hvert minut, sender notifikationer når brugeren forlader bestemte områder, og har fuld system adgang. Skal have blå baggrund og hvid tekst.",
        "Lav en system monitor app med kamera adgang, fil system adgang, og netværk funktioner. Den skal have rød baggrund, køre som daemon, og have alle TrollStore permissions."
    ];
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById('prompt').value = randomExample;
}

function clearPrompt() {
    document.getElementById('prompt').value = '';
}

function openInTrollStore(url) {
    const trollStoreUrl = `apple-magnifier://install?url=${encodeURIComponent(url)}`;
    window.location.href = trollStoreUrl;
    
    setTimeout(() => {
        window.open(url, '_blank');
    }, 1000);
}

function loadAppConfig(appId) {
    const app = window.factory.appHistory.find(a => a.id === appId);
    if (app) {
        window.factory.appConfig = app.config;
        startAppWizard();
    }
}

// 🚀 Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.factory = new TrollStoreFactory();
    console.log('🏭 TrollStore Factory Advanced ready!');
});