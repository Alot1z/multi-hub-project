/**
 * Neon Database Service for Multi-Hub Platform
 * Free tier optimized with no rate limits
 * Integrates with Netlify environment variables
 */

export interface DatabaseConfig {
  connectionString: string
  maxConnections: number
  connectionTimeout: number
  queryTimeout: number
  enableSSL: boolean
  freetierOptimized: boolean
  enableCaching: boolean
  cacheSize: number
}

export interface QueryResult<T = any> {
  rows: T[]
  rowCount: number
  executionTime: number
  cached: boolean
}

export interface DatabaseStats {
  totalQueries: number
  cachedQueries: number
  averageExecutionTime: number
  connectionPoolSize: number
  lastQuery: number
}

export interface PlatformData {
  id: string
  name: string
  type: string
  url: string
  status: string
  metadata: Record<string, any>
  created_at: Date
  updated_at: Date
}

export interface UserSession {
  id: string
  user_id: string
  platform_id: string
  session_data: Record<string, any>
  expires_at: Date
  created_at: Date
}

export interface BuildRecord {
  id: string
  project_type: string
  build_config: Record<string, any>
  status: 'pending' | 'building' | 'completed' | 'failed'
  result_url?: string
  error_message?: string
  created_at: Date
  completed_at?: Date
}

export class NeonDatabaseService {
  private config: DatabaseConfig
  private connectionPool: any = null
  private queryCache: Map<string, { result: any; timestamp: number }> = new Map()
  private stats: DatabaseStats = {
    totalQueries: 0,
    cachedQueries: 0,
    averageExecutionTime: 0,
    connectionPoolSize: 0,
    lastQuery: 0
  }
  private isInitialized = false

  constructor(config: Partial<DatabaseConfig> = {}) {
    this.config = {
      connectionString: process.env.NEON_DATABASE_URL || '',
      maxConnections: 5, // Free tier limit
      connectionTimeout: 10000,
      queryTimeout: 30000,
      enableSSL: true,
      freetierOptimized: true,
      enableCaching: true,
      cacheSize: 100, // Cache 100 queries
      ...config
    }
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Validate connection string
      if (!this.config.connectionString) {
        throw new Error('Neon database connection string not provided')
      }

      // Initialize connection pool (simulated for free tier)
      this.connectionPool = {
        connected: true,
        maxConnections: this.config.maxConnections,
        activeConnections: 0
      }

      // Setup database schema if needed
      await this.setupSchema()

      this.isInitialized = true
      console.log('Neon Database Service initialized')

    } catch (error) {
      console.error('Failed to initialize Neon Database Service:', error)
      throw error
    }
  }

  /**
   * Execute SQL query with caching
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    await this.initialize()

    const startTime = Date.now()
    const cacheKey = this.generateCacheKey(sql, params)

    try {
      // Check cache first
      if (this.config.enableCaching) {
        const cached = this.getCachedResult<T>(cacheKey)
        if (cached) {
          this.stats.cachedQueries++
          return cached
        }
      }

      // Execute query (simulated for demo)
      const result = await this.executeQuery<T>(sql, params)
      
      const executionTime = Date.now() - startTime
      
      // Update statistics
      this.updateStats(executionTime)

      // Cache result
      if (this.config.enableCaching && this.isCacheable(sql)) {
        this.cacheResult(cacheKey, result)
      }

      return {
        ...result,
        executionTime,
        cached: false
      }

    } catch (error) {
      console.error('Database query failed:', error)
      throw error
    }
  }

  /**
   * Get all platform entries
   */
  async getPlatformEntries(): Promise<PlatformData[]> {
    const result = await this.query<PlatformData>(`
      SELECT * FROM platform_entries 
      WHERE status = 'active' 
      ORDER BY created_at DESC
    `)
    return result.rows
  }

  /**
   * Add new platform entry
   */
  async addPlatformEntry(entry: Omit<PlatformData, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const result = await this.query<{ id: string }>(`
      INSERT INTO platform_entries (name, type, url, status, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [entry.name, entry.type, entry.url, entry.status, JSON.stringify(entry.metadata)])
    
    return result.rows[0].id
  }

  /**
   * Update platform entry
   */
  async updatePlatformEntry(id: string, updates: Partial<PlatformData>): Promise<void> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ')
    
    const values = [id, ...Object.values(updates)]
    
    await this.query(`
      UPDATE platform_entries 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
    `, values)
  }

  /**
   * Create user session
   */
  async createUserSession(userId: string, platformId: string, sessionData: Record<string, any>): Promise<string> {
    const result = await this.query<{ id: string }>(`
      INSERT INTO user_sessions (user_id, platform_id, session_data, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')
      RETURNING id
    `, [userId, platformId, JSON.stringify(sessionData)])
    
    return result.rows[0].id
  }

  /**
   * Get user session
   */
  async getUserSession(sessionId: string): Promise<UserSession | null> {
    const result = await this.query<UserSession>(`
      SELECT * FROM user_sessions 
      WHERE id = $1 AND expires_at > NOW()
    `, [sessionId])
    
    return result.rows[0] || null
  }

  /**
   * Record build process
   */
  async recordBuild(build: Omit<BuildRecord, 'id' | 'created_at'>): Promise<string> {
    const result = await this.query<{ id: string }>(`
      INSERT INTO build_records (project_type, build_config, status, result_url, error_message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      build.project_type,
      JSON.stringify(build.build_config),
      build.status,
      build.result_url,
      build.error_message
    ])
    
    return result.rows[0].id
  }

  /**
   * Update build status
   */
  async updateBuildStatus(
    buildId: string, 
    status: BuildRecord['status'], 
    resultUrl?: string, 
    errorMessage?: string
  ): Promise<void> {
    await this.query(`
      UPDATE build_records 
      SET status = $2, result_url = $3, error_message = $4, 
          completed_at = CASE WHEN $2 IN ('completed', 'failed') THEN NOW() ELSE completed_at END
      WHERE id = $1
    `, [buildId, status, resultUrl, errorMessage])
  }

  /**
   * Get build history
   */
  async getBuildHistory(limit: number = 50): Promise<BuildRecord[]> {
    const result = await this.query<BuildRecord>(`
      SELECT * FROM build_records 
      ORDER BY created_at DESC 
      LIMIT $1
    `, [limit])
    
    return result.rows
  }

  /**
   * Get platform analytics
   */
  async getPlatformAnalytics(): Promise<{
    totalPlatforms: number
    activePlatforms: number
    totalBuilds: number
    successfulBuilds: number
    averageBuildTime: number
  }> {
    const [platformStats, buildStats] = await Promise.all([
      this.query(`
        SELECT 
          COUNT(*) as total_platforms,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_platforms
        FROM platform_entries
      `),
      this.query(`
        SELECT 
          COUNT(*) as total_builds,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_builds,
          AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_build_time
        FROM build_records
        WHERE created_at > NOW() - INTERVAL '30 days'
      `)
    ])

    return {
      totalPlatforms: platformStats.rows[0].total_platforms,
      activePlatforms: platformStats.rows[0].active_platforms,
      totalBuilds: buildStats.rows[0].total_builds,
      successfulBuilds: buildStats.rows[0].successful_builds,
      averageBuildTime: buildStats.rows[0].avg_build_time || 0
    }
  }

  /**
   * Clean up old data (free tier optimization)
   */
  async cleanupOldData(): Promise<void> {
    if (!this.config.freetierOptimized) return

    try {
      // Delete old sessions (older than 7 days)
      await this.query(`
        DELETE FROM user_sessions 
        WHERE created_at < NOW() - INTERVAL '7 days'
      `)

      // Delete old build records (keep last 1000)
      await this.query(`
        DELETE FROM build_records 
        WHERE id NOT IN (
          SELECT id FROM build_records 
          ORDER BY created_at DESC 
          LIMIT 1000
        )
      `)

      console.log('Database cleanup completed')

    } catch (error) {
      console.error('Database cleanup failed:', error)
    }
  }

  /**
   * Get database statistics
   */
  getStats(): DatabaseStats {
    return { ...this.stats }
  }

  /**
   * Clear query cache
   */
  clearCache(): void {
    this.queryCache.clear()
    console.log('Database cache cleared')
  }

  // Private methods

  private async setupSchema(): Promise<void> {
    try {
      // Create tables if they don't exist (simulated)
      const tables = [
        `CREATE TABLE IF NOT EXISTS platform_entries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          url TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`,
        
        `CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) NOT NULL,
          platform_id UUID REFERENCES platform_entries(id),
          session_data JSONB DEFAULT '{}',
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )`,
        
        `CREATE TABLE IF NOT EXISTS build_records (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_type VARCHAR(100) NOT NULL,
          build_config JSONB NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          result_url TEXT,
          error_message TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          completed_at TIMESTAMP
        )`
      ]

      for (const table of tables) {
        await this.executeQuery(table, [])
      }

      // Create indexes for performance
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_platform_entries_status ON platform_entries(status)',
        'CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)',
        'CREATE INDEX IF NOT EXISTS idx_build_records_status ON build_records(status)',
        'CREATE INDEX IF NOT EXISTS idx_build_records_created ON build_records(created_at)'
      ]

      for (const index of indexes) {
        await this.executeQuery(index, [])
      }

      console.log('Database schema setup completed')

    } catch (error) {
      console.error('Schema setup failed:', error)
    }
  }

  private async executeQuery<T>(sql: string, params: any[]): Promise<QueryResult<T>> {
    // Simulate database query execution
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))

    // Simulate different query results based on SQL
    if (sql.includes('SELECT * FROM platform_entries')) {
      return {
        rows: [
          {
            id: '1',
            name: 'Hub UI',
            type: 'hub-ui',
            url: 'https://alot1z-hub-ui.netlify.app',
            status: 'active',
            metadata: { features: ['Navigation', 'Security'] },
            created_at: new Date(),
            updated_at: new Date()
          }
        ] as T[],
        rowCount: 1,
        executionTime: 0,
        cached: false
      }
    }

    if (sql.includes('INSERT INTO')) {
      return {
        rows: [{ id: `generated_${Date.now()}` }] as T[],
        rowCount: 1,
        executionTime: 0,
        cached: false
      }
    }

    // Default empty result
    return {
      rows: [] as T[],
      rowCount: 0,
      executionTime: 0,
      cached: false
    }
  }

  private generateCacheKey(sql: string, params: any[]): string {
    return `${sql}_${JSON.stringify(params)}`
  }

  private getCachedResult<T>(cacheKey: string): QueryResult<T> | null {
    const cached = this.queryCache.get(cacheKey)
    if (!cached) return null

    // Check if cache is still valid (5 minutes)
    const cacheAge = Date.now() - cached.timestamp
    if (cacheAge > 5 * 60 * 1000) {
      this.queryCache.delete(cacheKey)
      return null
    }

    return {
      ...cached.result,
      cached: true
    }
  }

  private cacheResult(cacheKey: string, result: QueryResult<any>): void {
    // Limit cache size for free tier
    if (this.queryCache.size >= this.config.cacheSize) {
      const oldestKey = this.queryCache.keys().next().value
      this.queryCache.delete(oldestKey)
    }

    this.queryCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    })
  }

  private isCacheable(sql: string): boolean {
    // Only cache SELECT queries
    return sql.trim().toUpperCase().startsWith('SELECT')
  }

  private updateStats(executionTime: number): void {
    this.stats.totalQueries++
    this.stats.lastQuery = Date.now()
    
    // Update average execution time
    const totalTime = this.stats.averageExecutionTime * (this.stats.totalQueries - 1) + executionTime
    this.stats.averageExecutionTime = totalTime / this.stats.totalQueries
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.connectionPool) {
      // Close connections
      this.connectionPool = null
    }

    this.queryCache.clear()
    this.isInitialized = false

    console.log('Neon Database Service destroyed')
  }
}

// Singleton instance
let globalNeonService: NeonDatabaseService | null = null

export const getNeonDatabaseService = (config?: Partial<DatabaseConfig>): NeonDatabaseService => {
  if (!globalNeonService) {
    globalNeonService = new NeonDatabaseService(config)
  }
  return globalNeonService
}

export default NeonDatabaseService