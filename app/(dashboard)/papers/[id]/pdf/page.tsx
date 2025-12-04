'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PdfViewer } from '@/components/pdf/PdfViewer'
import { Card, CardContent } from '@/components/ui/card'

export default function PaperPDFPage() {
  const params = useParams()
  const router = useRouter()
  const [paper, setPaper] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchPaper()
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

      <div className="h-full">
        <PdfViewer
          fileUrl={pdfUrl}
          fileName={`${paper.title}.pdf`}
          paperId={params.id as string}
        />
      </div>
    </div>
  )
}
