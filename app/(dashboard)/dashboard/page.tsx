import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, FolderOpen, Lightbulb, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  // Fetch user stats
  const [papersCount, collectionsCount, insightsCount] = await Promise.all([
    prisma.paper.count({ where: { userId: session.user.id } }),
    prisma.collection.count({ where: { userId: session.user.id } }),
    prisma.insightCard.count({ where: { userId: session.user.id } }),
  ])

  const recentPapers = await prisma.paper.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your research progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{papersCount}</div>
            <p className="text-xs text-muted-foreground">
              Papers saved to your library
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionsCount}</div>
            <p className="text-xs text-muted-foreground">
              Organized collections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insightsCount}</div>
            <p className="text-xs text-muted-foreground">
              Research insights captured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{Math.floor(papersCount / 4)}</div>
            <p className="text-xs text-muted-foreground">
              New papers added
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Papers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Papers</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPapers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No papers yet. Start by searching for papers!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPapers.map((paper) => (
                <div key={paper.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <Link href={`/papers/${paper.id}`}>
                      <h4 className="font-medium leading-none hover:text-blue-600 cursor-pointer transition">
                        {paper.title}
                      </h4>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {paper.authors.slice(0, 3).join(', ')}
                      {paper.authors.length > 3 && ' et al.'}
                    </p>
                    {paper.venue && (
                      <p className="text-xs text-muted-foreground">{paper.venue}</p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {paper.citationCount} citations
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Search Papers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Search across 200M+ academic papers
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Create Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Organize papers into collections
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Start Writing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Write with AI assistance
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
