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

interface HighlightRect {
  left: number
  top: number
  width: number
  height: number
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
        // Calculate relative positions (as percentages) for the bounding rectangles
        const containerRect = containerRef.current?.getBoundingClientRect()
        const rects = containerRect ? textSelection.rects.map(rect => ({
          left: ((rect.left - containerRect.left) / containerRect.width) * 100,
          top: ((rect.top - containerRect.top) / containerRect.height) * 100,
          width: (rect.width / containerRect.width) * 100,
          height: (rect.height / containerRect.height) * 100,
        })) : []

        onAnnotationCreate({
          type: selectedTool,
          content: textSelection.text,
          highlight: textSelection.text,
          color: highlightColor,
          pageNumber,
          drawingData: JSON.stringify(rects),
        })
      }
      
      // Clear selection
      window.getSelection()?.removeAllRanges()
      setTextSelection(null)
    }

    createFromSelection()
  }, [textSelection, selectedTool, highlightColor, pageNumber, onAnnotationCreate, containerRef])

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
  const getColorStyle = (color: string, type: string, customOpacity?: number) => {
    const opacity = customOpacity !== undefined ? customOpacity : (type === 'highlight' ? 0.4 : 0.6)
    
    const colorMap: Record<string, { r: number; g: number; b: number }> = {
      yellow: { r: 255, g: 255, b: 0 },
      green: { r: 0, g: 255, b: 0 },
      blue: { r: 0, g: 150, b: 255 },
      pink: { r: 255, g: 192, b: 203 },
      orange: { r: 255, g: 165, b: 0 },
    }
    
    const rgb = colorMap[color] || colorMap.yellow
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
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
          // Render comment annotations
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
          
          // Render highlight, underline, and strikethrough annotations
          if ((annotation.type === 'highlight' || annotation.type === 'underline' || annotation.type === 'strikethrough') && annotation.drawingData) {
            try {
              const rects: HighlightRect[] = JSON.parse(annotation.drawingData)
              return (
                <div key={annotation.id} className="pointer-events-none">
                  {rects.map((rect, index) => {
                    const baseStyle = {
                      left: `${rect.left}%`,
                      top: `${rect.top}%`,
                      width: `${rect.width}%`,
                      height: `${rect.height}%`,
                    }

                    if (annotation.type === 'strikethrough') {
                      // For strikethrough, create a thin line through the middle
                      return (
                        <div
                          key={index}
                          className="absolute pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity flex items-center"
                          style={{
                            ...baseStyle,
                            backgroundColor: 'transparent',
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onAnnotationClick?.(annotation)
                          }}
                          title={annotation.content}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '2px',
                              backgroundColor: getColorStyle(annotation.color, 'strikethrough', 0.9),
                            }}
                          />
                        </div>
                      )
                    }

                    // For highlight and underline
                    return (
                      <div
                        key={index}
                        className="absolute pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          ...baseStyle,
                          backgroundColor: annotation.type === 'highlight' 
                            ? getColorStyle(annotation.color, 'highlight') 
                            : 'transparent',
                          borderBottom: annotation.type === 'underline' 
                            ? `2px solid ${getColorStyle(annotation.color, 'underline')}` 
                            : 'none',
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAnnotationClick?.(annotation)
                        }}
                        title={annotation.content}
                      />
                    )
                  })}
                </div>
              )
            } catch (e) {
              console.error(
                `Failed to parse annotation drawingData for annotation ${annotation.id} (type: ${annotation.type}):`,
                e
              )
              return null
            }
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
