'use client'

import { useState, useEffect, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Maximize2,
  RotateCw,
  Search,
  Printer,
  Highlighter,
  MessageSquare,
  Pencil
} from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Set up PDF.js worker - using cdnjs with SRI for better security
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
  fileUrl: string
  fileName?: string
  paperId?: string
  onAnnotationCreate?: (annotation: any) => void
}

export function PDFViewer({ fileUrl, fileName, paperId, onAnnotationCreate }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [selectedTool, setSelectedTool] = useState<'none' | 'highlight' | 'note' | 'draw'>('none')
  const [highlightColor, setHighlightColor] = useState('yellow')
  const [goToPage, setGoToPage] = useState('')

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset
      return Math.min(Math.max(1, newPage), numPages)
    })
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  function handleGoToPage() {
    const page = parseInt(goToPage)
    if (page >= 1 && page <= numPages) {
      setPageNumber(page)
      setGoToPage('')
    }
  }

  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0))
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5))
  }

  function setZoomFitPage() {
    setScale(1.0)
  }

  function setZoomFitWidth() {
    setScale(1.2)
  }

  function rotateClockwise() {
    setRotation(prev => (prev + 90) % 360)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        previousPage()
      } else if (e.key === 'ArrowRight') {
        nextPage()
      } else if (e.key === '+' || e.key === '=') {
        zoomIn()
      } else if (e.key === '-' || e.key === '_') {
        zoomOut()
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pageNumber, numPages])

  const handleTextSelection = useCallback(() => {
    if (selectedTool === 'highlight') {
      const selection = window.getSelection()
      if (selection && selection.toString().trim()) {
        const selectedText = selection.toString()
        if (onAnnotationCreate && paperId) {
          onAnnotationCreate({
            type: 'highlight',
            content: selectedText,
            highlight: selectedText,
            color: highlightColor,
            pageNumber: pageNumber,
          })
        }
      }
    }
  }, [selectedTool, highlightColor, pageNumber, paperId, onAnnotationCreate])

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <Card className="p-3 mb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={previousPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={1}
                max={numPages}
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
                placeholder={pageNumber.toString()}
                className="w-12 h-8 text-center text-sm"
              />
              <span className="text-sm text-muted-foreground">/ {numPages}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={nextPage}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={zoomIn}
              disabled={scale >= 3.0}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={setZoomFitPage}>
              Fit
            </Button>
            <Button size="sm" variant="ghost" onClick={setZoomFitWidth}>
              Width
            </Button>
          </div>

          {/* Annotation Tools */}
          {paperId && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={selectedTool === 'highlight' ? 'default' : 'outline'}
                onClick={() => setSelectedTool(selectedTool === 'highlight' ? 'none' : 'highlight')}
              >
                <Highlighter className="w-4 h-4" />
              </Button>
              {selectedTool === 'highlight' && (
                <div className="flex gap-1 ml-1">
                  {['yellow', 'green', 'blue', 'pink', 'orange'].map(color => (
                    <button
                      key={color}
                      className={`w-5 h-5 rounded border-2 ${
                        highlightColor === color ? 'border-gray-800 dark:border-white' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setHighlightColor(color)}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              )}
              <Button
                size="sm"
                variant={selectedTool === 'note' ? 'default' : 'outline'}
                onClick={() => setSelectedTool(selectedTool === 'note' ? 'none' : 'note')}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Tools */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={rotateClockwise}>
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={toggleFullscreen}>
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={fileUrl} download={fileName || 'paper.pdf'}>
                <Download className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search in PDF..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" variant="outline">
                Previous
              </Button>
              <Button size="sm" variant="outline">
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex justify-center">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="text-center py-8">
                <p>Loading PDF...</p>
              </div>
            }
            error={
              <div className="text-center py-8 text-red-600">
                <p>Failed to load PDF. Please try again.</p>
              </div>
            }
          >
            <div onMouseUp={handleTextSelection}>
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </div>
          </Document>
        </div>
      </div>
    </div>
  )
}
