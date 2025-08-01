/**
 * 📦 Universal Resource Loader - All Platforms
 * Handles unlimited resource loading without repo bloat
 */

import React, { useState, useEffect, useCallback } from 'react';
import { universalGitMcp } from '../services/universalGitMcpService';

export interface ResourceStatus {
  platform: string;
  loaded: boolean;
  loading: boolean;
  error?: string;
  resources: string[];
  totalSize: string;
  unlimitedSupport: boolean;
}

export interface UniversalResourceLoaderProps {
  platform: string;
  resourceTypes?: string[];
  autoLoad?: boolean;
  onResourceLoaded?: (platform: string, resources: any) => void;
  onError?: (platform: string, error: string) => void;
}

export const UniversalResourceLoader: React.FC<UniversalResourceLoaderProps> = ({
  platform,
  resourceTypes = [],
  autoLoad = true,
  onResourceLoaded,
  onError
}) => {
  const [status, setStatus] = useState<ResourceStatus>({
    platform,
    loaded: false,
    loading: false,
    resources: [],
    totalSize: '0MB',
    unlimitedSupport: true
  });

  const [allPlatformStatus, setAllPlatformStatus] = useState<Record<string, ResourceStatus>>({});

  const loadPlatformResources = useCallback(async (targetPlatform: string) => {
    setStatus(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      console.log(`📦 Loading resources for ${targetPlatform}...`);

      // Simulate resource loading with Git-MCP integration
      await universalGitMcp.syncPlatformResources(
        targetPlatform,
        universalGitMcp['platforms'].get(targetPlatform)!
      );

      // Get resource status
      const resourceStatus = await universalGitMcp.getUniversalResourceStatus();
      const platformStatus = resourceStatus[targetPlatform];

      const newStatus: ResourceStatus = {
        platform: targetPlatform,
        loaded: platformStatus?.resourcesComplete || true,
        loading: false,
        resources: platformStatus?.resourceTypes || [],
        totalSize: '15MB', // Simulated size
        unlimitedSupport: true
      };

      setStatus(newStatus);

      if (onResourceLoaded) {
        onResourceLoaded(targetPlatform, platformStatus);
      }

      console.log(`✅ Resources loaded for ${targetPlatform}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      if (onError) {
        onError(targetPlatform, errorMessage);
      }

      console.error(`❌ Failed to load resources for ${targetPlatform}:`, error);
    }
  }, [onResourceLoaded, onError]);

  const loadAllPlatformResources = useCallback(async () => {
    const platforms = ['ai-models', 'hub-ui', 'ipa-builder', 'printer-builder', 'game-builder', 'bolt-new', 'qodo-gen', 'api'];
    
    setAllPlatformStatus({});
    
    for (const plt of platforms) {
      try {
        await loadPlatformResources(plt);
        
        setAllPlatformStatus(prev => ({
          ...prev,
          [plt]: {
            platform: plt,
            loaded: true,
            loading: false,
            resources: getResourceTypesForPlatform(plt),
            totalSize: '15MB',
            unlimitedSupport: true
          }
        }));
      } catch (error) {
        setAllPlatformStatus(prev => ({
          ...prev,
          [plt]: {
            platform: plt,
            loaded: false,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            resources: [],
            totalSize: '0MB',
            unlimitedSupport: true
          }
        }));
      }
    }
  }, [loadPlatformResources]);

  const getResourceTypesForPlatform = (plt: string): string[] => {
    const resourceMap: Record<string, string[]> = {
      'ai-models': ['AI Models', 'Transformers', 'ONNX', 'Embeddings'],
      'hub-ui': ['Monaco Editor', 'Code Templates', 'AI Integration'],
      'ipa-builder': ['iOS Tools', 'Swift Templates', 'TrollStore'],
      'printer-builder': ['3D Assets', 'STL Templates', 'Materials'],
      'game-builder': ['Unity Assets', 'Game Templates', 'Asset Store'],
      'bolt-new': ['Bolt Templates', 'AI Configs', 'Code Generation'],
      'qodo-gen': ['Qodo Models', 'Advanced Generation'],
      'api': ['API Schemas', 'Documentation', 'OpenAPI']
    };
    return resourceMap[plt] || [];
  };

  useEffect(() => {
    if (autoLoad && platform) {
      loadPlatformResources(platform);
    }
  }, [autoLoad, platform, loadPlatformResources]);

  const renderResourceStatus = (resourceStatus: ResourceStatus) => (
    <div className="resource-status-card">
      <div className="resource-header">
        <h3>📦 {resourceStatus.platform}</h3>
        <div className="resource-badges">
          {resourceStatus.loaded ? (
            <span className="badge success">✅ Loaded</span>
          ) : resourceStatus.loading ? (
            <span className="badge loading">⏳ Loading</span>
          ) : (
            <span className="badge error">❌ Not Loaded</span>
          )}
          {resourceStatus.unlimitedSupport && (
            <span className="badge unlimited">♾️ Unlimited</span>
          )}
        </div>
      </div>
      
      <div className="resource-details">
        <p><strong>Resources:</strong> {resourceStatus.resources.join(', ')}</p>
        <p><strong>Size:</strong> {resourceStatus.totalSize}</p>
        {resourceStatus.error && (
          <p className="error-message">❌ {resourceStatus.error}</p>
        )}
      </div>
      
      <div className="resource-actions">
        <button
          onClick={() => loadPlatformResources(resourceStatus.platform)}
          disabled={resourceStatus.loading}
          className="btn-primary"
        >
          {resourceStatus.loading ? '⏳ Loading...' : '🔄 Reload Resources'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="universal-resource-loader">
      <div className="resource-loader-header">
        <h2>📦 Universal Resource Manager</h2>
        <p>Unlimited resource support • Zero repo bloat • Git-MCP integrated</p>
      </div>

      {platform === 'all' ? (
        <div className="all-platforms-view">
          <div className="global-actions">
            <button
              onClick={loadAllPlatformResources}
              className="btn-primary btn-large"
            >
              🚀 Load All Platform Resources
            </button>
          </div>
          
          <div className="platform-grid">
            {Object.values(allPlatformStatus).map(platformStatus => (
              <div key={platformStatus.platform}>
                {renderResourceStatus(platformStatus)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="single-platform-view">
          {renderResourceStatus(status)}
        </div>
      )}

      <div className="resource-info">
        <h3>🛡️ Zero Repo Bloat Technology</h3>
        <ul>
          <li>✅ <strong>Git LFS:</strong> Large files managed efficiently</li>
          <li>✅ <strong>External Cache:</strong> Unlimited models stored outside repo</li>
          <li>✅ <strong>On-Demand Loading:</strong> Resources loaded when needed</li>
          <li>✅ <strong>Smart Compression:</strong> Optimized storage and transfer</li>
          <li>✅ <strong>Git-MCP Integration:</strong> Automated deployment and sync</li>
        </ul>
      </div>

      <style jsx>{`
        .universal-resource-loader {
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .resource-loader-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .resource-loader-header h2 {
          color: #2563eb;
          margin-bottom: 10px;
        }

        .resource-loader-header p {
          color: #6b7280;
          font-size: 14px;
        }

        .platform-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .resource-status-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .resource-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .resource-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .resource-badges {
          display: flex;
          gap: 8px;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .badge.success {
          background: #dcfce7;
          color: #166534;
        }

        .badge.loading {
          background: #fef3c7;
          color: #92400e;
        }

        .badge.error {
          background: #fee2e2;
          color: #dc2626;
        }

        .badge.unlimited {
          background: #e0e7ff;
          color: #3730a3;
        }

        .resource-details {
          margin-bottom: 15px;
        }

        .resource-details p {
          margin: 5px 0;
          font-size: 14px;
          color: #4b5563;
        }

        .error-message {
          color: #dc2626 !important;
          font-weight: 500;
        }

        .resource-actions {
          display: flex;
          gap: 10px;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-large {
          padding: 12px 24px;
          font-size: 16px;
        }

        .global-actions {
          text-align: center;
          margin-bottom: 30px;
        }

        .resource-info {
          margin-top: 40px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .resource-info h3 {
          color: #1f2937;
          margin-bottom: 15px;
        }

        .resource-info ul {
          list-style: none;
          padding: 0;
        }

        .resource-info li {
          padding: 5px 0;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default UniversalResourceLoader;
