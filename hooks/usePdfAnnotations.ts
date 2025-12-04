'use client'

import { useState, useCallback, useEffect } from 'react'

export interface Annotation {
  id: string
  content: string
  highlight?: string | null
  color: string
  pageNumber?: number | null
  type: string
  positionX?: number | null
  positionY?: number | null
  startOffset?: number | null
  endOffset?: number | null
  drawingData?: string | null
  createdAt: string
  updatedAt: string
}

export interface AnnotationCreate {
  content: string
  highlight?: string
  color?: string
  pageNumber?: number
  type: 'highlight' | 'comment' | 'underline' | 'strikethrough'
  positionX?: number
  positionY?: number
  startOffset?: number
  endOffset?: number
  drawingData?: string
}

export function usePdfAnnotations(paperId: string) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch annotations
  const fetchAnnotations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/papers/${paperId}/annotations`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch annotations')
      }
      
      const data = await response.json()
      setAnnotations(data.annotations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Failed to fetch annotations:', err)
    } finally {
      setIsLoading(false)
    }
  }, [paperId])

  // Create annotation
  const createAnnotation = useCallback(async (annotation: AnnotationCreate): Promise<Annotation | null> => {
    try {
      const response = await fetch(`/api/papers/${paperId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotation),
      })

      if (!response.ok) {
        throw new Error('Failed to create annotation')
      }

      const newAnnotation = await response.json()
      setAnnotations(prev => [...prev, newAnnotation])
      return newAnnotation
    } catch (err) {
      console.error('Failed to create annotation:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [paperId])

  // Update annotation
  const updateAnnotation = useCallback(async (id: string, content: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/papers/${paperId}/annotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to update annotation')
      }

      const updated = await response.json()
      setAnnotations(prev => prev.map(a => a.id === id ? updated : a))
      return true
    } catch (err) {
      console.error('Failed to update annotation:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }, [paperId])

  // Delete annotation
  const deleteAnnotation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/papers/${paperId}/annotations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete annotation')
      }

      setAnnotations(prev => prev.filter(a => a.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete annotation:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }, [paperId])

  // Get annotations for specific page
  const getAnnotationsForPage = useCallback((pageNumber: number) => {
    return annotations.filter(a => a.pageNumber === pageNumber)
  }, [annotations])

  // Initial fetch
  useEffect(() => {
    if (paperId) {
      fetchAnnotations()
    }
  }, [paperId, fetchAnnotations])

  return {
    annotations,
    isLoading,
    error,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    getAnnotationsForPage,
    refetch: fetchAnnotations,
  }
}
