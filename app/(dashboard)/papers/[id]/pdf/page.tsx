'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PDFViewer } from '@/components/pdf/PDFViewer'
import { AnnotationPanel } from '@/components/pdf/AnnotationPanel'
import { Card, CardContent } from '@/components/ui/card'

interface Annotation {
  id: string
  content: string
  highlight?: string | null
  color: string
  pageNumber?: number | null
  type: string
  createdAt: string
  updatedAt: string
}

export default function PaperPDFPage() {
  const params = useParams()
  const router = useRouter()
  const [paper, setPaper] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchPaper()
      fetchAnnotations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchPaper = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/papers/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPaper(data)
        
        // Get PDF URL - either from uploaded path or external URL
        if (data.uploadedPdfPath) {
          // Fetch signed URL for Supabase storage
          const urlResponse = await fetch(`/api/papers/${params.id}/pdf-url`)
          if (urlResponse.ok) {
            const { url } = await urlResponse.json()
            setPdfUrl(url)
          } else {
            // Fallback to path if signed URL fails (for local files)
            setPdfUrl(data.uploadedPdfPath)
          }
        } else if (data.pdfUrl) {
          setPdfUrl(data.pdfUrl)
        }
      } else {
        alert('Paper not found')
        router.push('/papers')
      }
    } catch (error) {
      console.error('Failed to fetch paper:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnnotations = async () => {
    try {
      const response = await fetch(`/api/papers/${params.id}/annotations`)
      if (response.ok) {
        const data = await response.json()
        setAnnotations(data.annotations)
      }
    } catch (error) {
      console.error('Failed to fetch annotations:', error)
    }
  }

  const handleAnnotationCreate = async (annotation: any) => {
    try {
      const response = await fetch(`/api/papers/${params.id}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotation),
      })

      if (response.ok) {
        const newAnnotation = await response.json()
        setAnnotations([...annotations, newAnnotation])
      }
    } catch (error) {
      console.error('Failed to create annotation:', error)
    }
  }

  const handleAnnotationUpdate = async (id: string, content: string) => {
    try {
      const response = await fetch(`/api/papers/${params.id}/annotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const updated = await response.json()
        setAnnotations(annotations.map(a => a.id === id ? updated : a))
      }
    } catch (error) {
      console.error('Failed to update annotation:', error)
    }
  }

  const handleAnnotationDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/papers/${params.id}/annotations/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAnnotations(annotations.filter(a => a.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete annotation:', error)
    }
  }

  const handleAnnotationClick = (annotation: Annotation) => {
    // TODO: Scroll to annotation in PDF
    console.log('Navigate to annotation:', annotation)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading paper...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paper) {
    return null
  }

  if (!pdfUrl) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/papers/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No PDF Available</h3>
            <p className="text-muted-foreground mb-4">
              This paper doesn&apos;t have an uploaded PDF or external PDF URL.
            </p>
            <Link href={`/papers/${params.id}`}>
              <Button>Go to Paper Details</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/papers/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h2 className="text-xl font-bold truncate max-w-2xl">{paper.title}</h2>
        </div>
      </div>

      <div className="flex gap-4 h-full">
        <div className="flex-1 min-w-0">
          <PDFViewer
            fileUrl={pdfUrl}
            fileName={`${paper.title}.pdf`}
            paperId={params.id as string}
            onAnnotationCreate={handleAnnotationCreate}
          />
        </div>
        <AnnotationPanel
          paperId={params.id as string}
          annotations={annotations}
          onAnnotationUpdate={handleAnnotationUpdate}
          onAnnotationDelete={handleAnnotationDelete}
          onAnnotationClick={handleAnnotationClick}
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
        />
      </div>
    </div>
  )
}
