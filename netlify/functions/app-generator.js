// 🤖 App Generator API for TrollStore Factory
// Handles app generation requests and GitHub integration

const { Octokit } = require('@octokit/rest');
const { createClient } = require('@supabase/supabase-js');

// Initialize clients
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const REPO_OWNER = 'Alot1z';
const REPO_NAME = 'Insta';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { appConfig, generatedCode } = JSON.parse(event.body);
    
    console.log('🚀 Generating app:', appConfig.basicInfo.name);

    // 1. Save app to database
    const appId = await saveAppToDatabase(appConfig, generatedCode);
    
    // 2. Create GitHub branch and commit files
    const branchName = await createGitHubBranch(appId, appConfig);
    await commitGeneratedFiles(branchName, appConfig, generatedCode);
    
    // 3. Trigger GitHub Actions workflow
    const workflowRun = await triggerBuild(branchName);
    
    // 4. Update app with build info
    await updateAppBuildInfo(appId, workflowRun.id, branchName);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        appId,
        buildId: workflowRun.id,
        branchName,
        message: 'App generation started successfully'
      })
    };

  } catch (error) {
    console.error('❌ App generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'App generation failed',
        details: error.message 
      })
    };
  }
};

async function saveAppToDatabase(appConfig, generatedCode) {
  const appData = {
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: appConfig.basicInfo.name,
    description: appConfig.basicInfo.description,
    config: appConfig,
    generated_code: generatedCode,
    status: 'building',
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('apps')
        .insert(appData)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ App saved to database:', data.id);
      return data.id;
    } catch (error) {
      console.error('Database save error:', error);
      throw new Error('Failed to save app to database');
    }
  }

  return appData.id;
}

async function createGitHubBranch(appId, appConfig) {
  const branchName = `app-${appId}`;
  const appName = appConfig.basicInfo.name.replace(/\s+/g, '');

  try {
    // Get the main branch reference
    const { data: mainRef } = await octokit.rest.git.getRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: 'heads/main'
    });

    // Create new branch
    await octokit.rest.git.createRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: mainRef.object.sha
    });

    console.log('✅ Created GitHub branch:', branchName);
    return branchName;

  } catch (error) {
    console.error('GitHub branch creation error:', error);
    throw new Error('Failed to create GitHub branch');
  }
}

async function commitGeneratedFiles(branchName, appConfig, generatedCode) {
  const appName = appConfig.basicInfo.name.replace(/\s+/g, '');
  const appDir = `apps/${appName}`;

  try {
    // Prepare files to commit
    const filesToCommit = [
      {
        path: `${appDir}/Tweak.xm`,
        content: generatedCode.tweak
      },
      {
        path: `${appDir}/Makefile`,
        content: generatedCode.makefile
      },
      {
        path: `${appDir}/control`,
        content: generatedCode.control
      },
      {
        path: `${appDir}/Info.plist`,
        content: JSON.stringify(generatedCode.plist, null, 2)
      }
    ];

    // Add entitlements if they exist
    if (generatedCode.entitlements) {
      filesToCommit.push({
        path: `${appDir}/entitlements.plist`,
        content: generateEntitlementsPlist(generatedCode.entitlements)
      });
    }

    // Get current tree
    const { data: currentCommit } = await octokit.rest.repos.getCommit({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: branchName
    });

    // Create blobs for each file
    const blobs = await Promise.all(
      filesToCommit.map(async (file) => {
        const { data: blob } = await octokit.rest.git.createBlob({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64'
        });
        return {
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        };
      })
    );

    // Create new tree
    const { data: newTree } = await octokit.rest.git.createTree({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      base_tree: currentCommit.commit.tree.sha,
      tree: blobs
    });

    // Create commit
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      message: `[TrollStore Factory] Generate ${appConfig.basicInfo.name}\n\nFeatures: ${appConfig.features.join(', ')}\nEnvironment: ${appConfig.environment.type}\nGenerated by TrollStore Factory AI`,
      tree: newTree.sha,
      parents: [currentCommit.sha]
    });

    // Update branch reference
    await octokit.rest.git.updateRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${branchName}`,
      sha: newCommit.sha
    });

    console.log('✅ Committed generated files to branch:', branchName);

  } catch (error) {
    console.error('GitHub commit error:', error);
    throw new Error('Failed to commit generated files');
  }
}

async function triggerBuild(branchName) {
  try {
    // Trigger the build workflow
    const { data: workflowRun } = await octokit.rest.actions.createWorkflowDispatch({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      workflow_id: 'build.yml',
      ref: branchName
    });

    console.log('✅ Triggered GitHub Actions build');
    return workflowRun;

  } catch (error) {
    console.error('GitHub Actions trigger error:', error);
    throw new Error('Failed to trigger build');
  }
}

async function updateAppBuildInfo(appId, buildId, branchName) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('apps')
        .update({
          github_build_id: buildId,
          github_branch: branchName,
          status: 'building',
          build_started_at: new Date().toISOString()
        })
        .eq('id', appId);

      if (error) throw error;
      
      console.log('✅ Updated app build info');
    } catch (error) {
      console.error('Database update error:', error);
    }
  }
}

function generateEntitlementsPlist(entitlements) {
  let plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
`;

  for (const [key, value] of Object.entries(entitlements)) {
    plist += `\t<key>${key}</key>\n`;
    if (typeof value === 'boolean') {
      plist += `\t<${value}/>\n`;
    } else if (typeof value === 'string') {
      plist += `\t<string>${value}</string>\n`;
    } else if (Array.isArray(value)) {
      plist += `\t<array>\n`;
      value.forEach(item => {
        plist += `\t\t<string>${item}</string>\n`;
      });
      plist += `\t</array>\n`;
    }
  }

  plist += `</dict>
</plist>`;

  return plist;
}