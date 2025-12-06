import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Activity } from '@/types'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get recent papers
    const recentPapers = await prisma.paper.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(limit / 3),
      select: {
        id: true,
        title: true,
        createdAt: true,
      }
    })

    // Get recent insights
    const recentInsights = await prisma.insightCard.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(limit / 3),
      select: {
        id: true,
        title: true,
        createdAt: true,
      }
    })

    // Get recent collections
    const recentCollections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(limit / 3),
      select: {
        id: true,
        name: true,
        createdAt: true,
      }
    })

    // Combine and format activities
    const activities: Activity[] = [
      ...recentPapers.map(paper => ({
        id: paper.id,
        user: session.user.name || 'You',
        action: 'added',
        target: paper.title,
        time: formatTimeAgo(paper.createdAt),
        type: 'upload' as const,
      })),
      ...recentInsights.map(insight => ({
        id: insight.id,
        user: session.user.name || 'You',
        action: 'created insight',
        target: insight.title,
        time: formatTimeAgo(insight.createdAt),
        type: 'insight' as const,
      })),
      ...recentCollections.map(collection => ({
        id: collection.id,
        user: session.user.name || 'You',
        action: 'created collection',
        target: collection.name,
        time: formatTimeAgo(collection.createdAt),
        type: 'collection' as const,
      })),
    ]

    // Sort by time and limit
    activities.sort((a, b) => {
      const timeA = parseTimeAgo(a.time)
      const timeB = parseTimeAgo(b.time)
      return timeA - timeB
    })

    return NextResponse.json({ activities: activities.slice(0, limit) })
  } catch (error) {
    console.error('Activity GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

function parseTimeAgo(timeString: string): number {
  if (timeString === 'Just now') return 0
  if (timeString === 'Yesterday') return 86400000
  
  const match = timeString.match(/(\d+)\s+(min|hour|day|week)/)
  if (!match) return Infinity
  
  const value = parseInt(match[1])
  const unit = match[2]
  
  switch (unit) {
    case 'min': return value * 60000
    case 'hour': return value * 3600000
    case 'day': return value * 86400000
    case 'week': return value * 604800000
    default: return Infinity
  }
}
