// 🎮 Game Build Trigger Function
// Handles game generation requests

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const config = JSON.parse(event.body || '{}')
    
    // Mock game build process
    const buildId = `game_build_${Date.now()}`
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Game generation started successfully',
        buildId,
        config,
        estimatedTime: '5-10 minutes',
        downloadUrl: `https://github.com/Alot1z/game-builds/releases/download/${buildId}/${config.gameName || 'game'}.zip`
      })
    }
  } catch (error) {
    console.error('Game build trigger error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to trigger game build',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}