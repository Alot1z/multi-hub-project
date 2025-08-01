/**
 * 🔐 COMPLETE AUTH SYSTEM - Simple Enable/Disable + 2FA
 * 
 * FEATURES:
 * ✅ Simple toggle i auth-config.json
 * ✅ 2FA med Google Authenticator
 * ✅ Admin panel på /add-user (kun med 2FA)
 * ✅ Database + file backup
 * ✅ Perfect integration med Multi-Hub
 */

import { authenticator } from 'otplib'
import bcrypt from 'bcryptjs'

export interface AuthConfig {
  authSystem: {
    enabled: boolean
    enableUserLogin: boolean
    enableAddUser: boolean
    require2FA: boolean
    adminOnly: boolean
  }
  features: {
    enableGuestAccess: boolean
    enableUnlimitedUsage: boolean
    enableCrossModelAI: boolean
    maxProgramsPerMonth: number
    enableRealTimeSync: boolean
  }
  security: {
    enable2FAForAdmin: boolean
    enableDatabaseAuth: boolean
    enablePrivateRepoAuth: boolean
    requireSecretKey: boolean
    enableSessionTimeout: boolean
    sessionTimeoutMinutes: number
  }
  adminRoutes: {
    addUser: string
    manageUsers: string
    systemSettings: string
    analytics: string
  }
}

export interface User {
  id: string
  username: string
  email: string
  passwordHash: string
  twoFactorSecret?: string
  twoFactorEnabled: boolean
  isAdmin: boolean
  createdAt: Date
  lastLogin?: Date
  permissions: string[]
  usageStats: {
    programsThisMonth: number
    lastReset: Date
  }
}

export interface Session {
  id: string
  userId: string
  createdAt: Date
  expiresAt: Date
  ipAddress: string
  userAgent: string
  isValid: boolean
}

class AuthService {
  private config: AuthConfig | null = null
  private users = new Map<string, User>()
  private sessions = new Map<string, Session>()
  private isInitialized = false

  constructor() {
    this.initializeAuth()
  }

  // Initialize authentication system
  private async initializeAuth() {
    try {
      await this.loadConfig()
      
      if (this.config?.authSystem.enabled) {
        await this.loadUsers()
        await this.loadSessions()
        
        // Create default admin if none exists
        if (this.users.size === 0) {
          await this.createDefaultAdmin()
        }
        
        console.log('🔐 Auth system initialized')
      } else {
        console.log('🔓 Auth system disabled - guest access enabled')
      }
      
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      this.isInitialized = true // Continue without auth
    }
  }

  // Load configuration from auth-config.json
  private async loadConfig() {
    try {
      const response = await fetch('/api/fs/read?path=config/auth-config.json')
      if (response.ok) {
        this.config = await response.json()
      } else {
        throw new Error('Auth config not found')
      }
    } catch (error) {
      console.error('Failed to load auth config:', error)
      // Default config (disabled)
      this.config = {
        authSystem: {
          enabled: false,
          enableUserLogin: false,
          enableAddUser: false,
          require2FA: true,
          adminOnly: true
        },
        features: {
          enableGuestAccess: true,
          enableUnlimitedUsage: true,
          enableCrossModelAI: true,
          maxProgramsPerMonth: 50,
          enableRealTimeSync: true
        },
        security: {
          enable2FAForAdmin: true,
          enableDatabaseAuth: true,
          enablePrivateRepoAuth: true,
          requireSecretKey: true,
          enableSessionTimeout: true,
          sessionTimeoutMinutes: 60
        },
        adminRoutes: {
          addUser: '/add-user',
          manageUsers: '/admin/users',
          systemSettings: '/admin/settings',
          analytics: '/admin/analytics'
        }
      }
    }
  }

  // Load users from database and file backup
  private async loadUsers() {
    try {
      // Try database first
      const dbUsers = await this.loadUsersFromDatabase()
      if (dbUsers.length > 0) {
        dbUsers.forEach(user => this.users.set(user.id, user))
        return
      }

      // Fallback to file
      const response = await fetch('/api/fs/read?path=auth/data/users.json')
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([id, user]) => {
          this.users.set(id, user as User)
        })
      }
    } catch (error) {
      console.log('No existing users found')
    }
  }

  // Load users from Neon database
  private async loadUsersFromDatabase(): Promise<User[]> {
    try {
      const response = await fetch('/api/database/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.warn('Database not available, using file backup')
    }
    
    return []
  }

  // Save users to database and file
  private async saveUsers() {
    const usersData = Object.fromEntries(this.users)
    
    // Save to database
    try {
      await fetch('/api/database/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Array.from(this.users.values()))
      })
    } catch (error) {
      console.warn('Failed to save to database, using file backup')
    }

    // Save to file backup
    try {
      await fetch('/api/fs/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'auth/data/users.json',
          content: JSON.stringify(usersData, null, 2)
        })
      })
    } catch (error) {
      console.error('Failed to save users to file:', error)
    }
  }

  // Create default admin user
  private async createDefaultAdmin() {
    const adminId = 'admin-' + Date.now()
    const defaultPassword = 'admin123' // Should be changed on first login
    const passwordHash = await bcrypt.hash(defaultPassword, 12)
    
    // Generate 2FA secret
    const twoFactorSecret = authenticator.generateSecret()
    
    const admin: User = {
      id: adminId,
      username: 'admin',
      email: 'admin@alot1z.github.io',
      passwordHash,
      twoFactorSecret,
      twoFactorEnabled: true,
      isAdmin: true,
      createdAt: new Date(),
      permissions: ['admin', 'add-user', 'manage-users', 'system-settings'],
      usageStats: {
        programsThisMonth: 0,
        lastReset: new Date()
      }
    }
    
    this.users.set(adminId, admin)
    await this.saveUsers()
    
    console.log('🔑 Default admin created:')
    console.log('Username: admin')
    console.log('Password: admin123')
    console.log('2FA Secret:', twoFactorSecret)
    console.log('QR Code URL:', this.generate2FAQRCode('admin', twoFactorSecret))
  }

  // Generate 2FA QR code URL
  private generate2FAQRCode(username: string, secret: string): string {
    const issuer = 'Multi-Hub Platform'
    const label = `${issuer}:${username}`
    return authenticator.keyuri(username, issuer, secret)
  }

  // Check if authentication is required
  isAuthRequired(): boolean {
    return this.config?.authSystem.enabled || false
  }

  // Check if route requires authentication
  requiresAuth(path: string): boolean {
    if (!this.isAuthRequired()) return false
    
    // Admin routes always require auth
    const adminRoutes = Object.values(this.config?.adminRoutes || {})
    if (adminRoutes.some(route => path.startsWith(route))) {
      return true
    }
    
    // If guest access is disabled, all routes require auth
    if (!this.config?.features.enableGuestAccess) {
      return true
    }
    
    return false
  }

  // Login user
  async login(username: string, password: string, twoFactorCode?: string): Promise<{
    success: boolean
    sessionId?: string
    requires2FA?: boolean
    error?: string
  }> {
    if (!this.isAuthRequired()) {
      return { success: true, sessionId: 'guest-session' }
    }

    // Find user
    const user = Array.from(this.users.values()).find(u => u.username === username)
    if (!user) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Check password
    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    if (!passwordValid) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled && this.config?.security.enable2FAForAdmin) {
      if (!twoFactorCode) {
        return { success: false, requires2FA: true }
      }

      const isValid2FA = authenticator.verify({
        token: twoFactorCode,
        secret: user.twoFactorSecret!
      })

      if (!isValid2FA) {
        return { success: false, error: 'Invalid 2FA code' }
      }
    }

    // Create session
    const sessionId = this.generateSessionId()
    const session: Session = {
      id: sessionId,
      userId: user.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (this.config?.security.sessionTimeoutMinutes || 60) * 60 * 1000),
      ipAddress: 'unknown', // Would be set by middleware
      userAgent: 'unknown', // Would be set by middleware
      isValid: true
    }

    this.sessions.set(sessionId, session)
    
    // Update last login
    user.lastLogin = new Date()
    await this.saveUsers()

    return { success: true, sessionId }
  }

  // Validate session
  validateSession(sessionId: string): User | null {
    if (!this.isAuthRequired()) {
      // Return guest user
      return {
        id: 'guest',
        username: 'guest',
        email: 'guest@alot1z.github.io',
        passwordHash: '',
        twoFactorEnabled: false,
        isAdmin: false,
        createdAt: new Date(),
        permissions: ['use-platform'],
        usageStats: {
          programsThisMonth: 0,
          lastReset: new Date()
        }
      }
    }

    const session = this.sessions.get(sessionId)
    if (!session || !session.isValid || session.expiresAt < new Date()) {
      return null
    }

    const user = this.users.get(session.userId)
    return user || null
  }

  // Check if user can access admin routes
  canAccessAdmin(user: User): boolean {
    return user.isAdmin && user.permissions.includes('admin')
  }

  // Check if user can add users
  canAddUsers(user: User): boolean {
    if (!this.config?.authSystem.enableAddUser) return false
    return user.isAdmin && user.permissions.includes('add-user')
  }

  // Add new user (admin only)
  async addUser(adminUser: User, userData: {
    username: string
    email: string
    password: string
    isAdmin?: boolean
    permissions?: string[]
  }): Promise<{ success: boolean; error?: string; twoFactorSecret?: string }> {
    if (!this.canAddUsers(adminUser)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(u => 
      u.username === userData.username || u.email === userData.email
    )
    
    if (existingUser) {
      return { success: false, error: 'User already exists' }
    }

    // Create new user
    const userId = 'user-' + Date.now()
    const passwordHash = await bcrypt.hash(userData.password, 12)
    const twoFactorSecret = authenticator.generateSecret()
    
    const newUser: User = {
      id: userId,
      username: userData.username,
      email: userData.email,
      passwordHash,
      twoFactorSecret,
      twoFactorEnabled: this.config?.security.enable2FAForAdmin || false,
      isAdmin: userData.isAdmin || false,
      createdAt: new Date(),
      permissions: userData.permissions || ['use-platform'],
      usageStats: {
        programsThisMonth: 0,
        lastReset: new Date()
      }
    }

    this.users.set(userId, newUser)
    await this.saveUsers()

    return { 
      success: true, 
      twoFactorSecret: newUser.twoFactorEnabled ? twoFactorSecret : undefined 
    }
  }

  // Check usage limits
  canUseProgram(user: User): boolean {
    if (!this.config?.features.enableUnlimitedUsage) {
      const maxPrograms = this.config?.features.maxProgramsPerMonth || 50
      
      // Reset monthly counter if needed
      const now = new Date()
      const lastReset = new Date(user.usageStats.lastReset)
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        user.usageStats.programsThisMonth = 0
        user.usageStats.lastReset = now
        this.saveUsers()
      }
      
      return user.usageStats.programsThisMonth < maxPrograms
    }
    
    return true // Unlimited usage enabled
  }

  // Increment usage counter
  async incrementUsage(user: User) {
    user.usageStats.programsThisMonth++
    await this.saveUsers()
  }

  // Generate session ID
  private generateSessionId(): string {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }

  // Load sessions
  private async loadSessions() {
    try {
      const response = await fetch('/api/fs/read?path=auth/data/sessions.json')
      if (response.ok) {
        const data = await response.json()
        Object.entries(data).forEach(([id, session]) => {
          this.sessions.set(id, session as Session)
        })
      }
    } catch (error) {
      console.log('No existing sessions found')
    }
  }

  // Get system status
  getSystemStatus(): {
    authEnabled: boolean
    userLoginEnabled: boolean
    addUserEnabled: boolean
    unlimitedUsage: boolean
    crossModelAI: boolean
    totalUsers: number
    activeSessions: number
  } {
    return {
      authEnabled: this.config?.authSystem.enabled || false,
      userLoginEnabled: this.config?.authSystem.enableUserLogin || false,
      addUserEnabled: this.config?.authSystem.enableAddUser || false,
      unlimitedUsage: this.config?.features.enableUnlimitedUsage || false,
      crossModelAI: this.config?.features.enableCrossModelAI || false,
      totalUsers: this.users.size,
      activeSessions: Array.from(this.sessions.values()).filter(s => 
        s.isValid && s.expiresAt > new Date()
      ).length
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService
