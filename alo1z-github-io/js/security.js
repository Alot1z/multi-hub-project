// 🔒 Multi-Hub Platform Security System
// This file handles secure platform loading with 5-layer verification

class PlatformSecurity {
    constructor() {
        this.expectedDomain = 'alot1z.github.io';
        this.expectedRepo = 'github.com/Alot1z/multi-hub-project';
        this.expectedNetlifyPattern = /alot1z.*\.netlify\.app/;
        this.maxRetries = 3;
        this.retryCount = 0;
    }

    async loadSecurePlatform() {
        const loading = document.getElementById('loading');
        const btn = document.getElementById('mainPlatform');
        const errorDiv = document.getElementById('error');
        
        try {
            this.showLoading('Verifying security credentials...');
            
            // Layer 1: Domain verification
            if (!this.verifyCurrentDomain()) {
                throw new Error('Domain verification failed');
            }
            
            this.showLoading('Loading public configuration...');
            
            // Layer 2: Load public platform.txt
            const publicConfig = await this.loadPublicConfig();
            
            // Layer 3: Verify public config integrity
            if (!this.verifyPublicConfig(publicConfig)) {
                throw new Error('Public configuration verification failed');
            }
            
            this.showLoading('Accessing private repository...');
            
            // Layer 4: Load private config
            const privateConfig = await this.loadPrivateConfig(publicConfig.privateRepoUrl);
            
            // Layer 5: Triple verification
            if (!this.verifyTripleMatch(publicConfig, privateConfig)) {
                throw new Error('Triple verification failed');
            }
            
            this.showLoading('Launching secure platform...');
            
            // Final redirect
            const hubUrl = privateConfig.hubUrl;
            if (this.verifyNetlifyUrl(hubUrl)) {
                console.log('✅ All security checks passed. Redirecting to:', hubUrl);
                window.location.href = hubUrl;
            } else {
                throw new Error('Hub URL verification failed');
            }
            
        } catch (error) {
            console.error('❌ Security check failed:', error);
            this.showError(error.message);
            
            // Retry mechanism
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                setTimeout(() => {
                    console.log(`🔄 Retry attempt ${this.retryCount}/${this.maxRetries}`);
                    this.loadSecurePlatform();
                }, 2000);
            }
        }
    }

    verifyCurrentDomain() {
        const currentDomain = window.location.hostname.toLowerCase();
        const isValid = currentDomain === this.expectedDomain || 
                       currentDomain === 'localhost' || 
                       currentDomain === '127.0.0.1';
        
        console.log('🔍 Domain check:', currentDomain, isValid ? '✅' : '❌');
        return isValid;
    }

    async loadPublicConfig() {
        const response = await fetch('./platform.txt', {
            cache: 'no-cache',
            headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load public config: ${response.status}`);
        }
        
        const data = await response.text();
        const lines = data.trim().split('\n').filter(line => line.trim());
        
        return {
            baseUrl: lines[0]?.trim(),
            privateRepoUrl: lines[1]?.trim(),
            raw: data
        };
    }

    verifyPublicConfig(config) {
        if (!config.baseUrl || !config.privateRepoUrl) {
            console.error('❌ Missing URLs in public config');
            return false;
        }
        
        if (!config.baseUrl.includes(this.expectedDomain)) {
            console.error('❌ Invalid base URL:', config.baseUrl);
            return false;
        }
        
        if (!config.privateRepoUrl.includes(this.expectedRepo)) {
            console.error('❌ Invalid private repo URL:', config.privateRepoUrl);
            return false;
        }
        
        console.log('✅ Public config verified');
        return true;
    }

    async loadPrivateConfig(repoUrl) {
        const rawUrl = repoUrl.replace('github.com', 'raw.githubusercontent.com') + '/main/platform.txt';
        
        const response = await fetch(rawUrl, {
            cache: 'no-cache',
            headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) {
            throw new Error(`Cannot access private config: ${response.status}`);
        }
        
        const data = await response.text();
        const lines = data.trim().split('\n').filter(line => line.trim());
        
        return {
            baseUrl: lines[0]?.trim(),
            repoUrl: lines[1]?.trim(),
            hubUrl: lines[2]?.trim(),
            ipaUrl: lines[3]?.trim(),
            printerUrl: lines[4]?.trim(),
            gameUrl: lines[5]?.trim(),
            aiUrl: lines[6]?.trim(),
            raw: data
        };
    }

    verifyTripleMatch(publicConfig, privateConfig) {
        // Base URL must match exactly
        if (publicConfig.baseUrl !== privateConfig.baseUrl) {
            console.error('❌ Base URL mismatch');
            return false;
        }
        
        // Repo URL must match exactly
        if (publicConfig.privateRepoUrl !== privateConfig.repoUrl) {
            console.error('❌ Repo URL mismatch');
            return false;
        }
        
        // All Netlify URLs must be valid
        const netlifyUrls = [
            privateConfig.hubUrl,
            privateConfig.ipaUrl,
            privateConfig.printerUrl,
            privateConfig.gameUrl,
            privateConfig.aiUrl
        ];
        
        for (const url of netlifyUrls) {
            if (!this.verifyNetlifyUrl(url)) {
                console.error('❌ Invalid Netlify URL:', url);
                return false;
            }
        }
        
        console.log('✅ Triple verification passed');
        return true;
    }

    verifyNetlifyUrl(url) {
        if (!url) return false;
        return this.expectedNetlifyPattern.test(url) && url.includes('https://');
    }

    showLoading(message) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'block';
            loading.textContent = message;
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        const loading = document.getElementById('loading');
        const btn = document.getElementById('mainPlatform');
        
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = `
                <div style="color: #ef4444; margin-top: 1rem;">
                    <strong>Security Check Failed</strong><br>
                    ${message}<br><br>
                    <small>This platform requires proper authentication.</small>
                </div>
            `;
        }
        
        if (loading) loading.style.display = 'none';
        if (btn) btn.style.display = 'none';
    }
}

// Initialize security system
const platformSecurity = new PlatformSecurity();

// Export for global access
window.PlatformSecurity = platformSecurity;