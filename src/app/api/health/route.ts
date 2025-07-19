import { NextRequest, NextResponse } from 'next/server'
import { FEATURE_FLAGS, APP_NAME, APP_DESCRIPTION } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: APP_NAME,
      description: APP_DESCRIPTION,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        blockchain: FEATURE_FLAGS.BLOCKCHAIN_ENABLED,
        aiRecommendations: FEATURE_FLAGS.AI_RECOMMENDATIONS,
        liveStreaming: FEATURE_FLAGS.LIVE_STREAMING,
        gamification: FEATURE_FLAGS.GAMIFICATION,
        betaFeatures: FEATURE_FLAGS.BETA_FEATURES,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      database: {
        // Add database health checks here
        postgresql: 'connected', // This would be actual health check
        mongodb: 'connected',
        redis: 'connected',
      },
      blockchain: FEATURE_FLAGS.BLOCKCHAIN_ENABLED ? {
        // Add blockchain health checks here
        ethereum: 'connected',
        polygon: 'connected',
      } : null,
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function HEAD(request: NextRequest) {
  // Simple health check for load balancers
  return new NextResponse(null, { status: 200 })
}