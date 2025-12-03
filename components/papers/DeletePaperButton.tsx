'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeletePaperButtonProps {
  paperId: string
}

export function DeletePaperButton({ paperId }: DeletePaperButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this paper? This will also remove all annotations and insights.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/papers/${paperId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete paper')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete paper')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4 text-red-600" />
    </Button>
  )
}
