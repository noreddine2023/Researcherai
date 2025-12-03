'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronRight, ChevronLeft, Trash2, Edit2, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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

interface AnnotationPanelProps {
  paperId: string
  annotations: Annotation[]
  onAnnotationUpdate: (id: string, content: string) => void
  onAnnotationDelete: (id: string) => void
  onAnnotationClick: (annotation: Annotation) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function AnnotationPanel({
  paperId,
  annotations,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationClick,
  isCollapsed,
  onToggleCollapse,
}: AnnotationPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [panelWidth, setPanelWidth] = useState(350)
  const [isResizing, setIsResizing] = useState(false)

  // Group annotations by page
  const annotationsByPage = annotations.reduce((acc, annotation) => {
    const page = annotation.pageNumber || 0
    if (!acc[page]) {
      acc[page] = []
    }
    acc[page].push(annotation)
    return acc
  }, {} as Record<number, Annotation[]>)

  const sortedPages = Object.keys(annotationsByPage)
    .map(Number)
    .sort((a, b) => a - b)

  const handleStartEdit = (annotation: Annotation) => {
    setEditingId(annotation.id)
    setEditContent(annotation.content)
  }

  const handleSaveEdit = () => {
    if (editingId) {
      onAnnotationUpdate(editingId, editContent)
      setEditingId(null)
      setEditContent('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this annotation?')) {
      onAnnotationDelete(id)
    }
  }

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      yellow: 'bg-yellow-100 border-yellow-300',
      green: 'bg-green-100 border-green-300',
      blue: 'bg-blue-100 border-blue-300',
      pink: 'bg-pink-100 border-pink-300',
      orange: 'bg-orange-100 border-orange-300',
    }
    return colors[color] || 'bg-gray-100 border-gray-300'
  }

  if (isCollapsed) {
    return (
      <div className="flex items-center h-full">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCollapse}
          className="h-32 rounded-l-lg rounded-r-none border-r-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className="flex h-full"
      style={{ width: `${panelWidth}px`, minWidth: '250px', maxWidth: '500px' }}
    >
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg">Annotations</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {annotations.length} total
            </span>
            <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4 px-4 pb-4">
          {annotations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No annotations yet. Select text in the PDF to create highlights or add notes.
            </p>
          ) : (
            sortedPages.map(page => (
              <div key={page} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground sticky top-0 bg-background py-1">
                  Page {page || 'Unknown'}
                </h3>
                {annotationsByPage[page].map(annotation => (
                  <div
                    key={annotation.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition hover:shadow-md ${getColorClass(
                      annotation.color
                    )}`}
                    onClick={() => onAnnotationClick(annotation)}
                  >
                    {editingId === annotation.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[80px]"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {annotation.highlight && (
                          <div className="text-sm font-medium mb-2 line-clamp-2">
                            &quot;{annotation.highlight}&quot;
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{annotation.content}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-300">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(annotation.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartEdit(annotation)
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(annotation.id)
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
