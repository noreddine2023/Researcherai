import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { PaperDetailClient } from '@/components/papers/PaperDetailClient'

async function getPaper(id: string, userId: string) {
  return await prisma.paper.findFirst({
    where: { id, userId },
    include: {
      annotations: true,
      insights: true,
      collections: {
        include: {
          collection: true,
        },
      },
    },
  })
}

export default async function PaperDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const paper = await getPaper(params.id, session.user.id)

  if (!paper) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Paper Not Found</h2>
        <p className="text-muted-foreground">This paper does not exist or has been removed.</p>
      </div>
    )
  }

  // Serialize the paper data for the Client Component
  const serializedPaper = {
    ...paper,
    publicationDate: paper.publicationDate?.toISOString() || null,
    createdAt: paper.createdAt.toISOString(),
    updatedAt: paper.updatedAt.toISOString(),
    annotations: paper.annotations.map(a => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    insights: paper.insights.map(i => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    })),
    collections: paper.collections.map(cp => ({
      ...cp,
      createdAt: cp.createdAt.toISOString(),
    })),
  }

  return <PaperDetailClient paper={serializedPaper} />
}
