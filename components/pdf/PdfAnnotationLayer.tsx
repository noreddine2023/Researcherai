'use client'

import { useRef, useEffect, useState } from 'react'
import { Annotation, AnnotationCreate } from '@/hooks/usePdfAnnotations'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface PdfAnnotationLayerProps {
  pageNumber: number
  annotations: Annotation[]
  scale: number
  selectedTool: 'none' | 'highlight' | 'comment' | 'underline' | 'strikethrough'
  highlightColor: string
  onAnnotationCreate: (annotation: AnnotationCreate) => void
  onAnnotationClick?: (annotation: Annotation) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export function PdfAnnotationLayer({
  pageNumber,
  annotations,
  scale,
  selectedTool,
  highlightColor,
  onAnnotationCreate,
  onAnnotationClick,
  containerRef,
}: PdfAnnotationLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const [textSelection, setTextSelection] = useState<{
    text: string
    rects: DOMRect[]
  } | null>(null)
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null)
  const [commentContent, setCommentContent] = useState('')

  // Handle text selection for highlighting
  useEffect(() => {
    if (!containerRef.current) return

    const handleMouseUp = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        setTextSelection(null)
        return
      }

      const selectedText = selection.toString().trim()
      if (!selectedText) {
        setTextSelection(null)
        return
      }

      // Get bounding rectangles
      const range = selection.getRangeAt(0)
      const rects = Array.from(range.getClientRects())

      if (rects.length > 0) {
        setTextSelection({
          text: selectedText,
          rects: rects as DOMRect[],
        })
      }
    }

    const container = containerRef.current
    container.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('mouseup', handleMouseUp)
    }
  }, [containerRef])

  // Handle annotation creation from text selection
  useEffect(() => {
    if (!textSelection || selectedTool === 'none') return

    const createFromSelection = () => {
      if (selectedTool === 'highlight' || selectedTool === 'underline' || selectedTool === 'strikethrough') {
        onAnnotationCreate({
          type: selectedTool,
          content: textSelection.text,
          highlight: textSelection.text,
          color: highlightColor,
          pageNumber,
        })
      }
      
      // Clear selection
      window.getSelection()?.removeAllRanges()
      setTextSelection(null)
    }

    createFromSelection()
  }, [textSelection, selectedTool, highlightColor, pageNumber, onAnnotationCreate])

  // Handle click for comment tool
  const handleLayerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool !== 'comment' || !layerRef.current) return

    const rect = layerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setCommentPosition({ x, y })
    setCommentDialogOpen(true)
  }

  const handleCommentSubmit = () => {
    if (commentContent.trim() && commentPosition) {
      onAnnotationCreate({
        type: 'comment',
        content: commentContent.trim(),
        color: 'yellow',
        pageNumber,
        positionX: commentPosition.x,
        positionY: commentPosition.y,
      })
      setCommentContent('')
      setCommentDialogOpen(false)
      setCommentPosition(null)
    }
  }

  const handleCommentCancel = () => {
    setCommentContent('')
    setCommentDialogOpen(false)
    setCommentPosition(null)
  }

  // Get color style for annotation
  const getColorStyle = (color: string, type: string) => {
    const opacity = type === 'highlight' ? '0.4' : '0.6'
    
    const colors: Record<string, string> = {
      yellow: `rgba(255, 255, 0, ${opacity})`,
      green: `rgba(0, 255, 0, ${opacity})`,
      blue: `rgba(0, 150, 255, ${opacity})`,
      pink: `rgba(255, 192, 203, ${opacity})`,
      orange: `rgba(255, 165, 0, ${opacity})`,
    }
    
    return colors[color] || colors.yellow
  }

  const pageAnnotations = annotations.filter(a => a.pageNumber === pageNumber)

  return (
    <>
      <div
        ref={layerRef}
        className="absolute inset-0 pointer-events-auto"
        style={{ cursor: selectedTool === 'comment' ? 'crosshair' : 'default' }}
        onClick={handleLayerClick}
      >
        {/* Render existing annotations */}
        {pageAnnotations.map(annotation => {
          if (annotation.type === 'comment' && annotation.positionX && annotation.positionY) {
            return (
              <div
                key={annotation.id}
                className="absolute w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-xs font-bold shadow-lg"
                style={{
                  left: `${annotation.positionX}%`,
                  top: `${annotation.positionY}%`,
                  backgroundColor: annotation.color,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onAnnotationClick?.(annotation)
                }}
                title={annotation.content}
              >
                💬
              </div>
            )
          }
          
          return null
        })}

        {/* Show current text selection highlight preview */}
        {textSelection && selectedTool !== 'none' && selectedTool !== 'comment' && (
          <div className="absolute inset-0 pointer-events-none">
            {textSelection.rects.map((rect, index) => {
              const containerRect = containerRef.current?.getBoundingClientRect()
              if (!containerRect) return null

              return (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: rect.left - containerRect.left,
                    top: rect.top - containerRect.top,
                    width: rect.width,
                    height: rect.height,
                    backgroundColor: getColorStyle(highlightColor, selectedTool),
                    ...(selectedTool === 'underline' && {
                      backgroundColor: 'transparent',
                      borderBottom: `2px solid ${getColorStyle(highlightColor, 'underline')}`,
                    }),
                    ...(selectedTool === 'strikethrough' && {
                      backgroundColor: 'transparent',
                      borderTop: `2px solid ${getColorStyle(highlightColor, 'strikethrough')}`,
                      marginTop: rect.height / 2,
                    }),
                  }}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCommentCancel}>
              Cancel
            </Button>
            <Button onClick={handleCommentSubmit} disabled={!commentContent.trim()}>
              Add Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
