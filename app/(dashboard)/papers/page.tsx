import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Upload, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { DeletePaperButton } from '@/components/papers/DeletePaperButton'
import { UploadPdfButton } from '@/components/papers/UploadPdfButton'

async function getUserPapers(userId: string) {
  return await prisma.paper.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      collections: {
        include: {
          collection: true,
        },
      },
    },
  })
}

export default async function PapersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const papers = await getUserPapers(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Papers</h2>
        <p className="text-muted-foreground">
          All your saved research papers
        </p>
      </div>

      {papers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No papers yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by searching for papers and saving them to your library
            </p>
            <Button asChild>
              <Link href="/search">Search Papers</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {papers.length} paper{papers.length !== 1 ? 's' : ''} in your library
          </div>
          {papers.map((paper) => {
            const year = paper.publicationDate 
              ? new Date(paper.publicationDate).getFullYear() 
              : null

            return (
              <Card key={paper.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link href={`/papers/${paper.id}`}>
                        <CardTitle className="text-lg hover:text-blue-600 cursor-pointer transition">
                          {paper.title}
                        </CardTitle>
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">
                        {paper.authors?.slice(0, 3).join(', ')}
                        {paper.authors && paper.authors.length > 3 && ' et al.'}
                      </div>
                    </div>
                    <DeletePaperButton paperId={paper.id} />
                  </div>
                </CardHeader>
                <CardContent>
                  {paper.abstract && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {paper.abstract}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {paper.venue && <span>{paper.venue}</span>}
                      {year && <span>{year}</span>}
                      {paper.citationCount !== undefined && (
                        <span>{paper.citationCount} citations</span>
                      )}
                      {paper.collections.length > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                          {paper.collections.length} collection{paper.collections.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {paper.uploadedPdfPath ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/papers/${paper.id}/pdf`}>
                            <FileText className="w-4 h-4 mr-2" />
                            View PDF
                          </Link>
                        </Button>
                      ) : (
                        <UploadPdfButton paperId={paper.id} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
