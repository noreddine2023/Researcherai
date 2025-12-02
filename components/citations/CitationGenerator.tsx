'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Copy, Check } from 'lucide-react'

interface CitationGeneratorProps {
  paperId: string
  paper: {
    title: string
    authors: string[]
    venue?: string
    publicationDate?: Date
    doi?: string
  }
}

const CITATION_STYLES = [
  { value: 'apa', label: 'APA' },
  { value: 'mla', label: 'MLA' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'harvard', label: 'Harvard' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'vancouver', label: 'Vancouver' },
]

export function CitationGenerator({ paperId, paper }: CitationGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = useState('apa')
  const [citation, setCitation] = useState('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const generateCitation = async (style: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId, style }),
      })
      const data = await response.json()
      setCitation(data.citation)
    } catch (error) {
      console.error('Citation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(citation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = async (format: 'bibtex' | 'ris') => {
    const response = await fetch('/api/citations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paperId, format }),
    })
    const data = await response.json()
    
    const blob = new Blob([data.citation], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `citation.${format}`
    a.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Citation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Citation Style</Label>
          <div className="flex flex-wrap gap-2">
            {CITATION_STYLES.map((style) => (
              <Button
                key={style.value}
                variant={selectedStyle === style.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedStyle(style.value)
                  generateCitation(style.value)
                }}
              >
                {style.label}
              </Button>
            ))}
          </div>
        </div>

        {citation && (
          <div className="space-y-2">
            <div className="relative">
              <div className="p-4 bg-muted rounded-lg text-sm font-mono">
                {citation}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('bibtex')}
          >
            Export BibTeX
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('ris')}
          >
            Export RIS
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
