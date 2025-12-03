'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookmarkPlus, ExternalLink, Info } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface PaperCardProps {
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
  }
  onSave?: (paper: any) => void
  onViewDetails?: (paper: any) => void
}

export function PaperCard({ paper, onSave, onViewDetails }: PaperCardProps) {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave(paper)
    } finally {
      setIsSaving(false)
    }
  }

  const year = paper.publicationDate 
    ? new Date(paper.publicationDate).getFullYear() 
    : null

  return (
    <Card className="hover:shadow-lg transition" onClick={() => !paper.id && onViewDetails?.(paper)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          {paper.id ? (
            <Link href={`/papers/${paper.id}`} onClick={(e) => e.stopPropagation()}>
              <CardTitle className="text-lg leading-tight hover:text-blue-600 transition cursor-pointer">
                {paper.title}
              </CardTitle>
            </Link>
          ) : (
            <CardTitle className="text-lg leading-tight cursor-pointer">{paper.title}</CardTitle>
          )}
          <div className="flex gap-1">
            {onViewDetails && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails(paper)
                }}
              >
                <Info className="w-4 h-4" />
              </Button>
            )}
            {onSave && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSave()
                }}
                disabled={isSaving}
              >
                <BookmarkPlus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {paper.authors?.slice(0, 3).join(', ')}
          {paper.authors && paper.authors.length > 3 && ' et al.'}
        </div>
      </CardHeader>
      <CardContent>
        {paper.abstract && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
            {paper.abstract}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {paper.venue && <span>{paper.venue}</span>}
            {year && <span>{year}</span>}
            {paper.citationCount !== undefined && (
              <span>{paper.citationCount} citations</span>
            )}
            {paper.source && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                {paper.source}
              </span>
            )}
          </div>
          {paper.pdfUrl && (
            <Button 
              size="sm" 
              variant="ghost" 
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
