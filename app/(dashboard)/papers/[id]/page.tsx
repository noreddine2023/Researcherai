import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Quote } from 'lucide-react'

export default async function PaperDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const paper = await prisma.paper.findUnique({
    where: { id: params.id },
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

  if (!paper) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Paper Not Found</h2>
        <p className="text-muted-foreground">This paper does not exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{paper.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{paper.authors.join(', ')}</span>
          {paper.venue && <span>• {paper.venue}</span>}
          {paper.publicationDate && (
            <span>• {new Date(paper.publicationDate).getFullYear()}</span>
          )}
          <span>• {paper.citationCount} citations</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {paper.pdfUrl && (
          <Button variant="outline" asChild>
            <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="w-4 h-4 mr-2" />
              View PDF
            </a>
          </Button>
        )}
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button variant="outline">
          <Quote className="w-4 h-4 mr-2" />
          Cite
        </Button>
      </div>

      {/* Abstract */}
      {paper.abstract && (
        <Card>
          <CardHeader>
            <CardTitle>Abstract</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{paper.abstract}</p>
          </CardContent>
        </Card>
      )}

      {/* AI Summary */}
      {paper.summary && (
        <Card>
          <CardHeader>
            <CardTitle>AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground">{paper.summary}</p>
              </div>
              {paper.methodology && (
                <div>
                  <h4 className="font-semibold mb-2">Methodology</h4>
                  <p className="text-sm text-muted-foreground">{paper.methodology}</p>
                </div>
              )}
              {paper.findings && (
                <div>
                  <h4 className="font-semibold mb-2">Key Findings</h4>
                  <p className="text-sm text-muted-foreground">{paper.findings}</p>
                </div>
              )}
              {paper.limitations && (
                <div>
                  <h4 className="font-semibold mb-2">Limitations</h4>
                  <p className="text-sm text-muted-foreground">{paper.limitations}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {paper.doi && (
              <>
                <dt className="text-sm font-medium text-muted-foreground">DOI</dt>
                <dd className="text-sm">{paper.doi}</dd>
              </>
            )}
            <dt className="text-sm font-medium text-muted-foreground">Added</dt>
            <dd className="text-sm">{new Date(paper.createdAt).toLocaleDateString()}</dd>
            <dt className="text-sm font-medium text-muted-foreground">Collections</dt>
            <dd className="text-sm">
              {paper.collections.length > 0
                ? paper.collections.map(cp => cp.collection.name).join(', ')
                : 'None'}
            </dd>
            <dt className="text-sm font-medium text-muted-foreground">Annotations</dt>
            <dd className="text-sm">{paper.annotations.length}</dd>
            <dt className="text-sm font-medium text-muted-foreground">Insights</dt>
            <dd className="text-sm">{paper.insights.length}</dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
