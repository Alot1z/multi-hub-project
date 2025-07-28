// 🔗 GitHub Webhook Handler for TrollStore Factory
// Handles incoming webhooks from GitHub Actions builds

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (will be configured with Netlify DB)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-GitHub-Event, X-GitHub-Delivery',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const githubEvent = event.headers['x-github-event'];
    const payload = JSON.parse(event.body);

    console.log('🔔 GitHub webhook received:', githubEvent);

    switch (githubEvent) {
      case 'workflow_run':
        return await handleWorkflowRun(payload);
      case 'release':
        return await handleRelease(payload);
      case 'push':
        return await handlePush(payload);
      default:
        console.log('ℹ️ Unhandled event type:', githubEvent);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Event received but not processed' })
        };
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function handleWorkflowRun(payload) {
  const { action, workflow_run } = payload;
  
  console.log(`🔄 Workflow ${workflow_run.name} ${action}`);

  if (workflow_run.name === '📱 Build TrollStore IPA') {
    const buildData = {
      github_run_id: workflow_run.id,
      status: action === 'completed' ? (workflow_run.conclusion === 'success' ? 'success' : 'failed') : 'running',
      started_at: workflow_run.run_started_at,
      completed_at: workflow_run.updated_at,
      conclusion: workflow_run.conclusion,
      html_url: workflow_run.html_url
    };

    // Update build status in database
    if (supabase) {
      try {
        const { error } = await supabase
          .from('builds')
          .upsert(buildData, { onConflict: 'github_run_id' });

        if (error) {
          console.error('Database update error:', error);
        } else {
          console.log('✅ Build status updated in database');
        }
      } catch (dbError) {
        console.error('Database connection error:', dbError);
      }
    }

    // If build completed successfully, process the artifacts
    if (action === 'completed' && workflow_run.conclusion === 'success') {
      await processSuccessfulBuild(workflow_run);
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'Workflow run processed' })
  };
}

async function handleRelease(payload) {
  const { action, release } = payload;
  
  if (action === 'published') {
    console.log('🎉 New release published:', release.tag_name);
    
    // Extract IPA download URLs from release assets
    const ipaAssets = release.assets.filter(asset => asset.name.endsWith('.ipa'));
    
    if (ipaAssets.length > 0 && supabase) {
      try {
        const releaseData = {
          tag_name: release.tag_name,
          name: release.name,
          body: release.body,
          published_at: release.published_at,
          html_url: release.html_url,
          assets: ipaAssets.map(asset => ({
            name: asset.name,
            download_url: asset.browser_download_url,
            size: asset.size
          }))
        };

        const { error } = await supabase
          .from('releases')
          .insert(releaseData);

        if (error) {
          console.error('Release database error:', error);
        } else {
          console.log('✅ Release saved to database');
        }
      } catch (dbError) {
        console.error('Database connection error:', dbError);
      }
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'Release processed' })
  };
}

async function handlePush(payload) {
  const { ref, commits, repository } = payload;
  
  // Only process pushes to main branch
  if (ref === 'refs/heads/main') {
    console.log(`📤 Push to main: ${commits.length} commits`);
    
    // Check if any commits contain new app generation
    const appCommits = commits.filter(commit => 
      commit.message.includes('[TrollStore Factory]') || 
      commit.added.some(file => file.startsWith('apps/'))
    );

    if (appCommits.length > 0) {
      console.log('🏭 App generation detected, triggering build...');
      // The push will automatically trigger the GitHub Actions workflow
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'Push processed' })
  };
}

async function processSuccessfulBuild(workflowRun) {
  console.log('🎉 Processing successful build:', workflowRun.id);
  
  // Here you could:
  // 1. Fetch artifacts from GitHub API
  // 2. Process IPA files
  // 3. Update app status in database
  // 4. Send notifications
  
  // For now, just log the success
  console.log('✅ Build processing completed');
}