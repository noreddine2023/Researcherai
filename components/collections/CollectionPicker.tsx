'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CollectionTree } from './CollectionTree'
import { useToast } from '@/components/ui/use-toast'

interface CollectionNode {
  id: string
  name: string
  description: string | null
  parentId: string | null
  paperCount: number
  children: CollectionNode[]
}

interface CollectionPickerProps {
  paperId: string
  isOpen: boolean
  onClose: () => void
  currentCollectionIds: string[]
  onSuccess?: () => void
}

export function CollectionPicker({
  paperId,
  isOpen,
  onClose,
  currentCollectionIds,
  onSuccess,
}: CollectionPickerProps) {
  const [collections, setCollections] = useState<CollectionNode[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchCollections()
    }
  }, [isOpen])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections/tree')
      if (response.ok) {
        const data = await response.json()
        setCollections(data.tree)
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error)
    }
  }

  const handleAddToCollection = async () => {
    if (!selectedId) {
      toast({
        title: 'Error',
        description: 'Please select a collection',
        variant: 'destructive',
      })
      return
    }

    if (currentCollectionIds.includes(selectedId)) {
      toast({
        title: 'Info',
        description: 'Paper is already in this collection',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/collections/${selectedId}/papers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Paper added to collection',
        })
        onSuccess?.()
        onClose()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to add paper to collection',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to add paper to collection:', error)
      toast({
        title: 'Error',
        description: 'Failed to add paper to collection',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto py-4">
          <CollectionTree
            collections={collections}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddToCollection} disabled={!selectedId || isLoading}>
            {isLoading ? 'Adding...' : 'Add to Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
