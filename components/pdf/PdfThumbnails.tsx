'use client'

import { useState } from 'react'
import { Document, Page } from 'react-pdf'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PdfThumbnailsProps {
  fileUrl: string
  numPages: number
  currentPage: number
  onPageChange: (page: number) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function PdfThumbnails({
  fileUrl,
  numPages,
  currentPage,
  onPageChange,
  isCollapsed,
  onToggleCollapse,
}: PdfThumbnailsProps) {
  const [hoveredPage, setHoveredPage] = useState<number | null>(null)

  if (isCollapsed) {
    return (
      <div className="flex items-center h-full">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCollapse}
          className="h-32 rounded-r-lg rounded-l-none border-l-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <Card className="flex flex-col h-full w-40 overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-sm font-semibold">Pages</span>
        <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
          <div
            key={pageNum}
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              pageNum === currentPage
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : hoveredPage === pageNum
                ? 'border-gray-400 shadow-md'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => onPageChange(pageNum)}
            onMouseEnter={() => setHoveredPage(pageNum)}
            onMouseLeave={() => setHoveredPage(null)}
          >
            <Document file={fileUrl}>
              <Page
                pageNumber={pageNum}
                width={136}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs text-center py-1">
              {pageNum}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
