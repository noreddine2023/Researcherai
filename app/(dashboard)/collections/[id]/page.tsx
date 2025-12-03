'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, FileText, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [collection, setCollection] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingPaperId, setUploadingPaperId] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchCollection()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchCollection = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/collections/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCollection(data)
      } else {
        alert('Collection not found')
        router.push('/collections')
      }
    } catch (error) {
      console.error('Failed to fetch collection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePaper = async (paperId: string) => {
    if (!confirm('Remove this paper from the collection?')) return

    try {
      const response = await fetch(
        `/api/collections/${params.id}/papers?paperId=${paperId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        fetchCollection()
      } else {
        alert('Failed to remove paper')
      }
    } catch (error) {
      console.error('Remove paper error:', error)
      alert('Failed to remove paper')
    }
  }

  const handleUploadPdf = async (paperId: string, file: File) => {
    setUploadingPaperId(paperId)
    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch(`/api/papers/${paperId}/upload-pdf`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        alert('PDF uploaded successfully!')
        fetchCollection()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload PDF')
      }
    } catch (error) {
      console.error('Upload PDF error:', error)
      alert('Failed to upload PDF')
    } finally {
      setUploadingPaperId(null)
    }
  }

  const handleFileSelect = (paperId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleUploadPdf(paperId, file)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading collection...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!collection) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/collections">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">{collection.name}</h2>
        {collection.description && (
          <p className="text-muted-foreground mt-2">{collection.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {collection.papers?.length || 0} papers
        </p>
      </div>

      {collection.papers && collection.papers.length > 0 ? (
        <div className="space-y-4">
          {collection.papers.map((cp: any) => (
            <Card key={cp.id} className="hover:shadow-lg transition">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/papers/${cp.paper.id}`}>
                      <CardTitle className="text-lg hover:text-blue-600 cursor-pointer">
                        {cp.paper.title}
                      </CardTitle>
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1">
                      {cp.paper.authors?.slice(0, 3).join(', ')}
                      {cp.paper.authors && cp.paper.authors.length > 3 && ' et al.'}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemovePaper(cp.paper.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {cp.paper.venue && <span>{cp.paper.venue}</span>}
                    {cp.paper.publicationDate && (
                      <span>
                        {new Date(cp.paper.publicationDate).getFullYear()}
                      </span>
                    )}
                    {cp.paper.citationCount !== undefined && (
                      <span>{cp.paper.citationCount} citations</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {cp.paper.uploadedPdfPath ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/papers/${cp.paper.id}/pdf`}>
                          <FileText className="w-4 h-4 mr-2" />
                          View PDF
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Input
                          id={`pdf-${cp.paper.id}`}
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => handleFileSelect(cp.paper.id, e)}
                          disabled={uploadingPaperId === cp.paper.id}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            document.getElementById(`pdf-${cp.paper.id}`)?.click()
                          }
                          disabled={uploadingPaperId === cp.paper.id}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingPaperId === cp.paper.id ? 'Uploading...' : 'Upload PDF'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No papers in this collection yet. Add papers from your saved papers or search results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
