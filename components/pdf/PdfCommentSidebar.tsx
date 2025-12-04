'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronRight, Trash2, Edit2, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Annotation } from '@/hooks/usePdfAnnotations'

interface PdfCommentSidebarProps {
  annotations: Annotation[]
  onAnnotationUpdate: (id: string, content: string) => void
  onAnnotationDelete: (id: string) => void
  onAnnotationClick: (annotation: Annotation) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function PdfCommentSidebar({
  annotations,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationClick,
  isCollapsed,
  onToggleCollapse,
}: PdfCommentSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

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
      yellow: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700',
      green: 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700',
      blue: 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700',
      pink: 'bg-pink-100 border-pink-300 dark:bg-pink-900/30 dark:border-pink-700',
      orange: 'bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700',
    }
    return colors[color] || colors.yellow
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'highlight': return '🖍️'
      case 'underline': return '📝'
      case 'strikethrough': return '❌'
      case 'comment': return '💬'
      default: return '📌'
    }
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
    <Card className="flex flex-col h-full w-80 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
        <CardTitle className="text-lg">Annotations</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {annotations.length}
          </span>
          <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
        {annotations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No annotations yet.</p>
            <p className="text-xs mt-2">
              Use the toolbar to add highlights, comments, or annotations.
            </p>
          </div>
        ) : (
          sortedPages.map(page => (
            <div key={page} className="space-y-2">
              <div className="sticky top-0 bg-background z-10 py-1 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Page {page || 'Unknown'}
                </h3>
              </div>
              
              {annotationsByPage[page].map(annotation => (
                <div
                  key={annotation.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getColorClass(
                    annotation.color
                  )}`}
                  onClick={() => onAnnotationClick(annotation)}
                >
                  {editingId === annotation.id ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
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
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-lg">{getTypeIcon(annotation.type)}</span>
                        <div className="flex-1 min-w-0">
                          {annotation.highlight && annotation.type !== 'comment' && (
                            <div className="text-sm font-medium mb-1 line-clamp-2">
                              &quot;{annotation.highlight}&quot;
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {annotation.content}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-current opacity-50">
                        <span className="text-xs">
                          {formatDistanceToNow(new Date(annotation.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
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
                            className="h-6 w-6 p-0"
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
  )
}
