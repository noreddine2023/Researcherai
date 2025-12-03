'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Upload } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface PaperActionsProps {
  paperId: string
  pdfUrl?: string | null
  uploadedPdfPath?: string | null
  onPdfUploaded: () => void
}

export function PaperActions({ paperId, pdfUrl, uploadedPdfPath, onPdfUploaded }: PaperActionsProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch(`/api/papers/${paperId}/upload-pdf`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        alert('PDF uploaded successfully!')
        onPdfUploaded()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload PDF')
      }
    } catch (error) {
      console.error('Upload PDF error:', error)
      alert('Failed to upload PDF')
    } finally {
      setIsUploading(false)
    }
  }

  const hasPdf = uploadedPdfPath || pdfUrl

  return (
    <div className="flex gap-2 flex-wrap">
      {uploadedPdfPath ? (
        <Button variant="default" asChild>
          <Link href={`/papers/${paperId}/pdf`}>
            <FileText className="w-4 h-4 mr-2" />
            View Uploaded PDF
          </Link>
        </Button>
      ) : pdfUrl ? (
        <Button variant="outline" asChild>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            <FileText className="w-4 h-4 mr-2" />
            View External PDF
          </a>
        </Button>
      ) : null}

      {!uploadedPdfPath && (
        <>
          <Input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('pdf-upload')?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload PDF'}
          </Button>
        </>
      )}
    </div>
  )
}
