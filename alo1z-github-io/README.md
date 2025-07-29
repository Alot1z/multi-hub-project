# Multi-Hub Platform

🏭 AI-driven DevOps platform for iOS, 3D Printing, Games & More

## How It Works

This public repository contains only the secure launcher system:

### 🔒 Security Flow:
1. **index.html** - Main launcher with security checks
2. **platform.txt** - Contains only base URL + private repo link
3. **Security verification** - Only Alot1z.github.io can access full system
4. **Private repo integration** - Loads all Netlify URLs securely

### 🚀 Integration Process:
1. User visits Alot1z.github.io
2. Launcher reads public platform.txt
3. Security check verifies base URL match
4. Loads private repo platform.txt via raw GitHub
5. Double verification of base URLs
6. Redirects to main hub-ui platform
7. Hub-ui loads all subproject URLs securely

### 📱 Available Platforms:
- **iOS App Builder** - TrollStore compatible apps
- **3D Printer Builder** - OpenSCAD model generation
- **Game Builder** - iOS game development
- **AI Models** - Local AI management

All platforms are loaded via secure iframe integration with cross-origin verification.

## Access

Visit [Alot1z.github.io](https://Alot1z.github.io) to launch the platform.

## Security

This repository contains only the public launcher. All platform URLs are securely stored in private repository and verified through a two-layer authentication system with base URL verification.

### 🛡️ Security Features:
- **Two-layer verification** - Public + private repo checks
- **Base URL validation** - Only authorized domains can access
- **No exposed URLs** - All Netlify URLs hidden in private repo
- **Cross-origin protection** - Iframe security headers
- **Raw GitHub integration** - Direct private repo access

## Upload System

This folder can be uploaded to Alot1z.github.io repository using the ultra simple upload system from the main multi-hub-project repository.

---

*Powered by Multi-Hub Platform v2.0*