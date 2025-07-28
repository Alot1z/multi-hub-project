// 📊 Build Status API for TrollStore Factory
// Provides real-time build status and download links

const { createClient } = require('@supabase/supabase-js');
const { Octokit } = require('@octokit/rest');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const REPO_OWNER = 'Alot1z';
const REPO_NAME = 'Insta';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { buildId, appId } = event.queryStringParameters || {};

    if (buildId) {
      // Get specific build status
      const buildStatus = await getBuildStatus(buildId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(buildStatus)
      };
    } else if (appId) {
      // Get app status
      const appStatus = await getAppStatus(appId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(appStatus)
      };
    } else {
      // Get all recent builds
      const recentBuilds = await getRecentBuilds();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(recentBuilds)
      };
    }

  } catch (error) {
    console.error('❌ Build status error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get build status',
        details: error.message 
      })
    };
  }
};

async function getBuildStatus(buildId) {
  try {
    // Get build info from GitHub Actions
    const { data: workflowRun } = await octokit.rest.actions.getWorkflowRun({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      run_id: buildId
    });

    const status = {
      id: buildId,
      status: workflowRun.status,
      conclusion: workflowRun.conclusion,
      created_at: workflowRun.created_at,
      updated_at: workflowRun.updated_at,
      html_url: workflowRun.html_url,
      logs_url: `${workflowRun.html_url}/logs`
    };

    // If build is completed successfully, get artifacts
    if (workflowRun.conclusion === 'success') {
      try {
        const { data: artifacts } = await octokit.rest.actions.listWorkflowRunArtifacts({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          run_id: buildId
        });

        status.artifacts = artifacts.artifacts.map(artifact => ({
          name: artifact.name,
          download_url: artifact.archive_download_url,
          size: artifact.size_in_bytes,
          created_at: artifact.created_at
        }));

        // Look for IPA files in releases
        const releases = await getRelatedReleases(buildId);
        if (releases.length > 0) {
          status.releases = releases;
          status.download_urls = releases.flatMap(release => 
            release.assets.filter(asset => asset.name.endsWith('.ipa'))
          );
        }
      } catch (artifactError) {
        console.error('Error fetching artifacts:', artifactError);
      }
    }

    return status;

  } catch (error) {
    console.error('GitHub API error:', error);
    throw new Error('Failed to get build status from GitHub');
  }
}

async function getAppStatus(appId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data: app, error } = await supabase
      .from('apps')
      .select('*')
      .eq('id', appId)
      .single();

    if (error) throw error;

    // Get build status if build ID exists
    if (app.github_build_id) {
      const buildStatus = await getBuildStatus(app.github_build_id);
      app.build_status = buildStatus;
    }

    return app;

  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to get app status from database');
  }
}

async function getRecentBuilds(limit = 10) {
  try {
    // Get recent workflow runs
    const { data: workflowRuns } = await octokit.rest.actions.listWorkflowRuns({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      workflow_id: 'build.yml',
      per_page: limit
    });

    const builds = workflowRuns.workflow_runs.map(run => ({
      id: run.id,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      created_at: run.created_at,
      updated_at: run.updated_at,
      html_url: run.html_url,
      head_branch: run.head_branch,
      head_commit: {
        message: run.head_commit.message,
        author: run.head_commit.author.name
      }
    }));

    return {
      builds,
      total_count: workflowRuns.total_count
    };

  } catch (error) {
    console.error('GitHub API error:', error);
    throw new Error('Failed to get recent builds');
  }
}

async function getRelatedReleases(buildId) {
  try {
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      per_page: 20
    });

    // Filter releases that might be related to this build
    // This is a simple heuristic - in practice you might want to store this relationship
    const relatedReleases = releases.filter(release => 
      release.body && release.body.includes(`build-${buildId}`)
    );

    return relatedReleases.map(release => ({
      id: release.id,
      tag_name: release.tag_name,
      name: release.name,
      published_at: release.published_at,
      html_url: release.html_url,
      assets: release.assets.map(asset => ({
        name: asset.name,
        download_url: asset.browser_download_url,
        size: asset.size
      }))
    }));

  } catch (error) {
    console.error('Error fetching releases:', error);
    return [];
  }
}