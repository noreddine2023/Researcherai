'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaperActions } from '@/components/papers/PaperActions'
import { PaperCollections } from '@/components/papers/PaperCollections'

interface PaperDetailClientProps {
  paper: {
    id: string
    title: string
    authors: string[]
    abstract: string | null
    venue: string | null
    publicationDate: string | null
    citationCount: number
    doi: string | null
    pdfUrl: string | null
    uploadedPdfPath: string | null
    summary: string | null
    methodology: string | null
    findings: string | null
    limitations: string | null
    createdAt: string
    updatedAt: string
    annotations: Array<{
      id: string
      createdAt: string
      updatedAt: string
      [key: string]: any
    }>
    insights: Array<{
      id: string
      createdAt: string
      updatedAt: string
      [key: string]: any
    }>
    collections: Array<{
      collection: {
        id: string
        name: string
      }
      createdAt: string
    }>
  }
}

export function PaperDetailClient({ paper }: PaperDetailClientProps) {
  const router = useRouter()
  
  const handlePdfUploaded = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{paper.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span>{paper.authors.join(', ')}</span>
          {paper.venue && <span>• {paper.venue}</span>}
          {paper.publicationDate && (
            <span>• {new Date(paper.publicationDate).getFullYear()}</span>
          )}
          <span>• {paper.citationCount} citations</span>
        </div>
      </div>

      {/* Actions */}
      <PaperActions 
        paperId={paper.id} 
        pdfUrl={paper.pdfUrl}
        uploadedPdfPath={paper.uploadedPdfPath}
        onPdfUploaded={handlePdfUploaded}
      />

      {/* Collections */}
      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <PaperCollections
            paperId={paper.id}
            collections={paper.collections.map(cp => cp.collection)}
          />
        </CardContent>
      </Card>

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
