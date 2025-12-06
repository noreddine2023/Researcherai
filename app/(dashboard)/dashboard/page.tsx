import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Brain, Target } from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/dashboard/StatCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Activity } from '@/types'

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

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session?. user?. id) {
        return null
    }

    // Fetch user stats
    const [papersCount, collectionsCount, insightsCount] = await Promise.all([
        prisma. paper.count({ where: { userId: session.user.id } }),
        prisma.collection.count({ where: { userId: session.user. id } }),
        prisma.insightCard.count({ where: { userId: session. user.id } }),
    ])

    const recentPapers = await prisma.paper. findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
    })

    // Get recent activity
    const recentPapersActivity = await prisma.paper.findMany({
        where: { userId: session.user. id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, title: true, createdAt: true }
    })

    const recentInsights = await prisma.insightCard. findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, title: true, createdAt: true }
    })

    const recentCollections = await prisma.collection. findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, name: true, createdAt: true }
    })

    const activities: Activity[] = [
        ... recentPapersActivity. map(paper => ({
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
            time: formatTimeAgo(insight. createdAt),
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
    ].slice(0, 8)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of your research progress
                </p>
            </div>

            {/* Stats Cards - FIXED: Use iconName string instead of icon component */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Papers"
                    value={papersCount}
                    change="+12%"
                    iconName="BookOpen"
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    label="AI Insights"
                    value={insightsCount}
                    change="+24%"
                    iconName="Brain"
                    color="bg-purple-50 text-purple-600"
                />
                <StatCard
                    label="Reading Hours"
                    value="32. 5"
                    change="-5%"
                    iconName="Clock"
                    color="bg-amber-50 text-amber-600"
                />
                <StatCard
                    label="Collections"
                    value={collectionsCount}
                    change="+2"
                    iconName="Target"
                    color="bg-emerald-50 text-emerald-600"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Papers */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Papers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentPapers.length === 0 ?  (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No papers yet.  Start by searching for papers! </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentPapers. map((paper) => (
                                    <div key={paper. id} className="flex items-start justify-between border-b pb-4 last:border-0">
                                        <div className="space-y-1 flex-1">
                                            <Link href={`/papers/${paper.id}`}>
                                                <h4 className="font-medium leading-none hover:text-blue-600 cursor-pointer transition line-clamp-2">
                                                    {paper.title}
                                                </h4>
                                            </Link>
                                            <p className="text-sm text-muted-foreground">
                                                {paper.authors.slice(0, 3).join(', ')}
                                                {paper.authors.length > 3 && ' et al.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <ActivityFeed activities={activities} />
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Link href="/search" className="group">
                            <div className="p-4 rounded-lg border hover:border-blue-500 hover:shadow-md transition cursor-pointer">
                                <FileText className="w-8 h-8 text-blue-600 mb-2" />
                                <h3 className="font-semibold mb-1">Search Papers</h3>
                                <p className="text-sm text-muted-foreground">
                                    Search across 200M+ academic papers
                                </p>
                            </div>
                        </Link>

                        <Link href="/collections" className="group">
                            <div className="p-4 rounded-lg border hover:border-emerald-500 hover:shadow-md transition cursor-pointer">
                                <Target className="w-8 h-8 text-emerald-600 mb-2" />
                                <h3 className="font-semibold mb-1">Create Collection</h3>
                                <p className="text-sm text-muted-foreground">
                                    Organize papers into collections
                                </p>
                            </div>
                        </Link>

                        <Link href="/write" className="group">
                            <div className="p-4 rounded-lg border hover:border-purple-500 hover:shadow-md transition cursor-pointer">
                                <Brain className="w-8 h-8 text-purple-600 mb-2" />
                                <h3 className="font-semibold mb-1">Start Writing</h3>
                                <p className="text-sm text-muted-foreground">
                                    Write with AI assistance
                                </p>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}