'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookmarkPlus, ExternalLink, FileText } from 'lucide-react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PaperDetailDialogProps {
  paper: {
    id?: string
    title: string
    authors?: string[]
    abstract?: string
    venue?: string
    publicationDate?: string | Date
    citationCount?: number
    pdfUrl?: string
    doi?: string
    source?: string
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (paper: any) => Promise<void>
}

export function PaperDetailDialog({ 
  paper, 
  open, 
  onOpenChange, 
  onSave 
}: PaperDetailDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [collections, setCollections] = useState<any[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  const [savedPaper, setSavedPaper] = useState<any>(null)

  useEffect(() => {
    if (open) {
      fetchCollections()
    }
  }, [open])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      const data = await response.json()
      setCollections(data.collections || [])
    } catch (error) {
      console.error('Failed to fetch collections:', error)
    }
  }

  const handleSave = async () => {
    if (!paper || !onSave) return
    setIsSaving(true)
    try {
      await onSave(paper)
      // Refetch to check if paper is now saved
      if (paper.doi) {
        const response = await fetch('/api/papers')
        const data = await response.json()
        const saved = data.papers?.find((p: any) => p.doi === paper.doi)
        if (saved) {
          setSavedPaper(saved)
        }
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddToCollection = async () => {
    if (!selectedCollection || !savedPaper) return
    
    try {
      const response = await fetch(`/api/collections/${selectedCollection}/papers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: savedPaper.id }),
      })

      if (response.ok) {
        alert('Paper added to collection!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add paper to collection')
      }
    } catch (error) {
      console.error('Add to collection error:', error)
      alert('Failed to add paper to collection')
    }
  }

  if (!paper) return null

  const year = paper.publicationDate 
    ? new Date(paper.publicationDate).getFullYear() 
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{paper.title}</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col gap-2 mt-2">
              <div className="text-sm">
                {paper.authors?.join(', ')}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {paper.venue && <span>{paper.venue}</span>}
                {year && <span>• {year}</span>}
                {paper.citationCount !== undefined && (
                  <span>• {paper.citationCount} citations</span>
                )}
                {paper.source && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                    {paper.source}
                  </span>
                )}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Abstract */}
          {paper.abstract && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Abstract</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {paper.abstract}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {paper.doi && (
                  <>
                    <dt className="font-medium text-muted-foreground">DOI:</dt>
                    <dd className="break-all">{paper.doi}</dd>
                  </>
                )}
                {paper.venue && (
                  <>
                    <dt className="font-medium text-muted-foreground">Venue:</dt>
                    <dd>{paper.venue}</dd>
                  </>
                )}
                {year && (
                  <>
                    <dt className="font-medium text-muted-foreground">Year:</dt>
                    <dd>{year}</dd>
                  </>
                )}
                {paper.citationCount !== undefined && (
                  <>
                    <dt className="font-medium text-muted-foreground">Citations:</dt>
                    <dd>{paper.citationCount}</dd>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {paper.pdfUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View External PDF
                  </a>
                </Button>
              )}
              {onSave && !savedPaper && (
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Paper'}
                </Button>
              )}
            </div>

            {savedPaper && collections.length > 0 && (
              <div className="flex gap-2 items-center">
                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  onClick={handleAddToCollection}
                  disabled={!selectedCollection}
                >
                  Add to Collection
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
