import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { InsightsClient } from '@/components/insights/InsightsClient'
import { Insight } from '@/types'

export default async function InsightsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const insightsData = await prisma.insightCard.findMany({
    where: { userId: session.user.id },
    include: {
      paper: true,
      todos: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Transform to match Insight type
  const insights: Insight[] = insightsData.map(insight => ({
    id: insight.id,
    title: insight.title,
    content: insight.content,
    type: insight.type as 'finding' | 'methodology' | 'limitation' | 'idea',
    status: insight.status as 'backlog' | 'in-progress' | 'review' | 'done',
    paperId: insight.paperId || undefined,
    tags: insight.tags,
    todos: insight.todos.map(todo => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
    })),
    comments: insight.comments.map(comment => ({
      id: comment.id,
      user: comment.user.name || 'Unknown',
      content: comment.content,
      timestamp: formatTimeAgo(comment.createdAt),
      userId: comment.userId,
    })),
  }))

  return <InsightsClient initialInsights={insights} />
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
  return date.toLocaleDateString()
}
