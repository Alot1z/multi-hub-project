# 🚀 Multi-Netlify Deployment Instructions

## Overview
This system consists of 5 separate Netlify projects that work together as one platform:

1. **hub-ui** - Main platform router (loads other projects via iframe)
2. **ipa-builder** - iOS app builder interface  
3. **printer-builder** - 3D printer model generator
4. **game-builder** - Game development interface
5. **ai-models** - AI model management and inference

## Step-by-Step Deployment

### 1. Create GitHub Repositories

Create these **private** repositories in your GitHub account:

```
hub-ui
ipa-builder  
printer-builder
game-builder
ai-models
```

### 2. Upload Code to Each Repository

For each folder in this project:
- Create a new private GitHub repo with the same name
- Upload all files from that folder to the repo
- Commit and push to main branch

### 3. Deploy to Netlify

For **each** of the 5 repositories:

1. Go to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select the repository
4. Build settings should auto-detect from `netlify.toml`
5. Click "Deploy site"
6. **Copy the random Netlify URL** (e.g., `https://amazing-unicorn-123456.netlify.app`)

### 4. Update Platform Configuration

After all 5 sites are deployed, update your main GitHub Pages repo:

In your `https://github.com/Alot1z/github.io` repository, create/update `.platform.json`:

```json
{
  "base_url": "https://alo1z.github.io",
  "subprojects": {
    "ipa-builder": "https://YOUR-IPA-NETLIFY-URL.netlify.app",
    "printer-builder": "https://YOUR-3D-NETLIFY-URL.netlify.app", 
    "game-builder": "https://YOUR-GAME-NETLIFY-URL.netlify.app",
    "ai-models": "https://YOUR-AI-NETLIFY-URL.netlify.app"
  }
}
```

### 5. Configure Environment Variables

For each Netlify project that needs GitHub integration, add these environment variables in Netlify dashboard:

- `GITHUB_TOKEN` - Your GitHub personal access token
- `SUPABASE_URL` - (optional) If using database
- `SUPABASE_ANON_KEY` - (optional) If using database

### 6. Test the System

1. Visit your main hub URL (from hub-ui Netlify deployment)
2. Click on each project to ensure iframe loading works
3. Test the build triggers and AI inference

## Project Structure

```
Your GitHub Account/
├── hub-ui/ (private repo) → Netlify Project 1
├── ipa-builder/ (private repo) → Netlify Project 2  
├── printer-builder/ (private repo) → Netlify Project 3
├── game-builder/ (private repo) → Netlify Project 4
├── ai-models/ (private repo) → Netlify Project 5
└── github.io/ (public repo) → GitHub Pages (platform config)
```

## Custom Domain (Optional)

If you want to use `mose.windsurf.build`:

1. In the hub-ui Netlify project, go to Domain settings
2. Add custom domain: `mose.windsurf.build`
3. Configure DNS to point to Netlify
4. Update `.platform.json` base_url accordingly

## Troubleshooting

- **iframe not loading**: Check X-Frame-Options headers in netlify.toml
- **Build failures**: Verify environment variables are set
- **CORS errors**: Ensure Access-Control-Allow-Origin is set to "*"
- **Platform config not loading**: Verify .platform.json is accessible via GitHub Pages

## Free Tier Limits

- **Netlify**: 300 build minutes/month total across all projects
- **GitHub Actions**: 2000 minutes/month  
- **GitHub Pages**: 1GB storage, 100GB bandwidth/month

Distribute usage across projects to stay within limits.