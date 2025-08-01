// Netlify Function for Real-Time Status Monitoring
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const services = [
      {
        id: 'launcher',
        name: 'Launcher',
        url: 'https://alot1z.github.io',
        githubRepo: 'Alot1z/Alot1z.github.io',
        netlifyId: null // GitHub Pages
      },
      {
        id: 'hub-ui',
        name: 'Hub UI',
        url: 'https://hub-uii.netlify.app',
        githubRepo: 'Alot1z/hub-ui',
        netlifyId: 'hub-uii'
      },
      {
        id: 'ipa-builder',
        name: 'IPA Builder',
        url: 'https://ipa-builder.netlify.app',
        githubRepo: 'Alot1z/ipa-builder',
        netlifyId: 'ipa-builder'
      },
      {
        id: 'printer-builder',
        name: 'Printer Builder',
        url: 'https://printer-builder.netlify.app',
        githubRepo: 'Alot1z/printer-builder',
        netlifyId: 'printer-builder'
      },
      {
        id: 'game-builder',
        name: 'Game Builder',
        url: 'https://game-build.netlify.app',
        githubRepo: 'Alot1z/game-builder',
        netlifyId: 'game-build'
      },
      {
        id: 'ai-models',
        name: 'AI Models',
        url: 'https://ai-modelss.netlify.app',
        githubRepo: 'Alot1z/ai-models',
        netlifyId: 'ai-modelss'
      }
    ];

    const statusResults = await Promise.allSettled(
      services.map(async (service) => {
        try {
          // Check service availability
          const startTime = Date.now();
          const response = await fetch(service.url, {
            method: 'HEAD',
            timeout: 10000
          });
          const responseTime = Date.now() - startTime;

          // Get GitHub repo status (if available)
          let githubStatus = null;
          if (process.env.GITHUB_TOKEN) {
            try {
              const githubResponse = await fetch(
                `https://api.github.com/repos/${service.githubRepo}`,
                {
                  headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'User-Agent': 'Multi-Hub-Status-Monitor'
                  }
                }
              );
              
              if (githubResponse.ok) {
                const repoData = await githubResponse.json();
                githubStatus = {
                  lastPush: repoData.pushed_at,
                  defaultBranch: repoData.default_branch,
                  size: repoData.size,
                  language: repoData.language
                };
              }
            } catch (error) {
              console.log(`GitHub API error for ${service.id}:`, error.message);
            }
          }

          // Get Netlify deployment status (if available)
          let netlifyStatus = null;
          if (service.netlifyId && process.env.NETLIFY_AUTH_TOKEN) {
            try {
              const netlifyResponse = await fetch(
                `https://api.netlify.com/api/v1/sites/${service.netlifyId}/deploys?per_page=1`,
                {
                  headers: {
                    'Authorization': `Bearer ${process.env.NETLIFY_AUTH_TOKEN}`
                  }
                }
              );
              
              if (netlifyResponse.ok) {
                const deployData = await netlifyResponse.json();
                if (deployData.length > 0) {
                  const latestDeploy = deployData[0];
                  netlifyStatus = {
                    state: latestDeploy.state,
                    createdAt: latestDeploy.created_at,
                    deployTime: latestDeploy.deploy_time,
                    commitRef: latestDeploy.commit_ref,
                    branch: latestDeploy.branch
                  };
                }
              }
            } catch (error) {
              console.log(`Netlify API error for ${service.id}:`, error.message);
            }
          }

          return {
            id: service.id,
            name: service.name,
            url: service.url,
            status: response.ok ? 'online' : 'offline',
            responseTime: responseTime,
            httpStatus: response.status,
            lastChecked: new Date().toISOString(),
            github: githubStatus,
            netlify: netlifyStatus
          };
        } catch (error) {
          return {
            id: service.id,
            name: service.name,
            url: service.url,
            status: 'offline',
            responseTime: 0,
            httpStatus: 0,
            lastChecked: new Date().toISOString(),
            error: error.message,
            github: null,
            netlify: null
          };
        }
      })
    );

    const results = statusResults.map(result => 
      result.status === 'fulfilled' ? result.value : result.reason
    );

    // Calculate overall statistics
    const onlineServices = results.filter(s => s.status === 'online').length;
    const totalServices = results.length;
    const avgResponseTime = Math.round(
      results
        .filter(s => s.responseTime > 0)
        .reduce((sum, s) => sum + s.responseTime, 0) / 
      results.filter(s => s.responseTime > 0).length
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        services: results,
        summary: {
          total: totalServices,
          online: onlineServices,
          offline: totalServices - onlineServices,
          avgResponseTime: isNaN(avgResponseTime) ? 0 : avgResponseTime,
          uptime: ((onlineServices / totalServices) * 100).toFixed(1)
        }
      })
    };

  } catch (error) {
    console.error('Status function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
