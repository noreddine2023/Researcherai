'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface UploadPdfButtonProps {
  paperId: string
}

export function UploadPdfButton({ paperId }: UploadPdfButtonProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

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
        toast({
          title: 'Success',
          description: 'PDF uploaded successfully!',
        })
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to upload PDF',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Upload PDF error:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload PDF',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Input
        id={`pdf-upload-${paperId}`}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => document.getElementById(`pdf-upload-${paperId}`)?.click()}
        disabled={isUploading}
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Upload PDF'}
      </Button>
    </>
  )
}
