'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface DeletePaperButtonProps {
  paperId: string
}

export function DeletePaperButton({ paperId }: DeletePaperButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

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
        toast({
          title: 'Success',
          description: 'Paper deleted successfully',
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete paper',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete paper',
        variant: 'destructive',
      })
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
