'use client'

import { useRef } from 'react'
import { Page } from 'react-pdf'
import { PdfAnnotationLayer } from './PdfAnnotationLayer'
import { Annotation } from '@/hooks/usePdfAnnotations'

interface PdfPageProps {
  pageNumber: number
  scale: number
  rotation: number
  annotations: Annotation[]
  selectedTool: 'none' | 'highlight' | 'comment' | 'underline' | 'strikethrough'
  highlightColor: string
  onAnnotationCreate: (annotation: any) => void
  onAnnotationClick?: (annotation: Annotation) => void
}

export function PdfPage({
  pageNumber,
  scale,
  rotation,
  annotations,
  selectedTool,
  highlightColor,
  onAnnotationCreate,
  onAnnotationClick,
}: PdfPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative inline-block shadow-lg">
      <Page
        pageNumber={pageNumber}
        scale={scale}
        rotate={rotation}
        renderTextLayer={true}
        renderAnnotationLayer={true}
        className="max-w-full"
      />
      <PdfAnnotationLayer
        pageNumber={pageNumber}
        annotations={annotations}
        scale={scale}
        selectedTool={selectedTool}
        highlightColor={highlightColor}
        onAnnotationCreate={onAnnotationCreate}
        onAnnotationClick={onAnnotationClick}
        containerRef={containerRef}
      />
    </div>
  )
}
