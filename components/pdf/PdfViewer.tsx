'use client'

import { useState, useEffect, useRef } from 'react'
import { Document, pdfjs } from 'react-pdf'
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
  Minimize2,
  RotateCw,
  Search,
  Printer
} from 'lucide-react'
import { PdfPage } from './PdfPage'
import { PdfToolbar } from './PdfToolbar'
import { PdfThumbnails } from './PdfThumbnails'
import { PdfCommentSidebar } from './PdfCommentSidebar'
import { usePdfAnnotations, Annotation } from '@/hooks/usePdfAnnotations'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PdfViewerProps {
  fileUrl: string
  fileName?: string
  paperId: string
}

export function PdfViewer({ fileUrl, fileName, paperId }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [goToPage, setGoToPage] = useState('')
  const [selectedTool, setSelectedTool] = useState<'none' | 'highlight' | 'comment' | 'underline' | 'strikethrough'>('none')
  const [highlightColor, setHighlightColor] = useState('yellow')
  const [thumbnailsCollapsed, setThumbnailsCollapsed] = useState(false)
  const [commentsCollapsed, setCommentsCollapsed] = useState(false)

  const viewerContainerRef = useRef<HTMLDivElement>(null)
  const {
    annotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
  } = usePdfAnnotations(paperId)

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
    if (!viewerContainerRef.current) return

    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'ArrowLeft') {
        previousPage()
      } else if (e.key === 'ArrowRight') {
        nextPage()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomIn()
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomOut()
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        }
        setSelectedTool('none')
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pageNumber, numPages])

  const handleAnnotationCreate = async (annotation: any) => {
    await createAnnotation(annotation)
  }

  const handleAnnotationClick = (annotation: Annotation) => {
    // Navigate to the annotation's page
    if (annotation.pageNumber) {
      setPageNumber(annotation.pageNumber)
    }
  }

  return (
    <div
      ref={viewerContainerRef}
      className={`flex flex-col h-full ${isFullscreen ? 'bg-gray-900' : ''}`}
    >
      {/* Top Controls */}
      <Card className={`p-3 ${isFullscreen ? 'mb-2' : 'mb-4'}`}>
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
                className="w-14 h-8 text-center text-sm"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                / {numPages}
              </span>
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
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
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

      {/* Annotation Toolbar */}
      {paperId && (
        <div className="mb-3">
          <PdfToolbar
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            highlightColor={highlightColor}
            onColorSelect={setHighlightColor}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
        {/* Thumbnails Sidebar */}
        {!thumbnailsCollapsed && (
          <PdfThumbnails
            fileUrl={fileUrl}
            numPages={numPages}
            currentPage={pageNumber}
            onPageChange={setPageNumber}
            isCollapsed={thumbnailsCollapsed}
            onToggleCollapse={() => setThumbnailsCollapsed(!thumbnailsCollapsed)}
          />
        )}
        {thumbnailsCollapsed && (
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setThumbnailsCollapsed(false)}
              className="h-32 rounded-r-lg rounded-l-none border-l-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* PDF Document */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex justify-center">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading PDF...</p>
                </div>
              }
              error={
                <div className="text-center py-8 text-red-600">
                  <p>Failed to load PDF. Please try again.</p>
                </div>
              }
            >
              <PdfPage
                pageNumber={pageNumber}
                scale={scale}
                rotation={rotation}
                annotations={annotations}
                selectedTool={selectedTool}
                highlightColor={highlightColor}
                onAnnotationCreate={handleAnnotationCreate}
                onAnnotationClick={handleAnnotationClick}
              />
            </Document>
          </div>
        </div>

        {/* Comments Sidebar */}
        {paperId && !commentsCollapsed && (
          <PdfCommentSidebar
            annotations={annotations}
            onAnnotationUpdate={updateAnnotation}
            onAnnotationDelete={deleteAnnotation}
            onAnnotationClick={handleAnnotationClick}
            isCollapsed={commentsCollapsed}
            onToggleCollapse={() => setCommentsCollapsed(!commentsCollapsed)}
          />
        )}
        {paperId && commentsCollapsed && (
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommentsCollapsed(false)}
              className="h-32 rounded-l-lg rounded-r-none border-r-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
