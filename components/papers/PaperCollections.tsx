'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { CollectionPicker } from '@/components/collections/CollectionPicker'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface Collection {
  id: string
  name: string
}

interface PaperCollectionsProps {
  paperId: string
  collections: Collection[]
}

export function PaperCollections({ paperId, collections: initialCollections }: PaperCollectionsProps) {
  const [collections, setCollections] = useState(initialCollections)
  const [showPicker, setShowPicker] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleRemoveFromCollection = async (collectionId: string) => {
    if (!confirm('Remove this paper from the collection?')) return

    try {
      const response = await fetch(
        `/api/collections/${collectionId}/papers?paperId=${paperId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setCollections(collections.filter(c => c.id !== collectionId))
        toast({
          title: 'Success',
          description: 'Paper removed from collection',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to remove paper from collection',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to remove paper:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove paper from collection',
        variant: 'destructive',
      })
    }
  }

  const handleSuccess = () => {
    // Refresh to show updated collections
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {collections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Not in any collections yet
          </p>
        ) : (
          collections.map(collection => (
            <div
              key={collection.id}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900 rounded-full text-sm"
            >
              <span>{collection.name}</span>
              <button
                onClick={() => handleRemoveFromCollection(collection.id)}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowPicker(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add to Collection
      </Button>

      <CollectionPicker
        paperId={paperId}
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        currentCollectionIds={collections.map(c => c.id)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
