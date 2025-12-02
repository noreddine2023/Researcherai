'use client'

import { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PaperCard } from '@/components/search/PaperCard'
import { SearchFilters } from '@/components/search/SearchFilters'
import { useRouter } from 'next/navigation'

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<any>({})

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20`)
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePaper = async (paper: any) => {
    try {
      const response = await fetch('/api/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: paper.title,
          authors: paper.authors || [],
          abstract: paper.abstract,
          publicationDate: paper.publicationDate,
          venue: paper.venue,
          doi: paper.doi,
          citationCount: paper.citationCount || 0,
          pdfUrl: paper.pdfUrl,
        }),
      })

      if (response.ok) {
        const savedPaper = await response.json()
        alert('Paper saved successfully!')
        router.push(`/papers/${savedPaper.id}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save paper')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Search Papers</h2>
        <p className="text-muted-foreground">
          Search across 200M+ academic papers from Semantic Scholar, OpenAlex, and Crossref
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for papers, authors, topics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SearchFilters onFilterChange={setFilters} />

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Found {results.length} results
          </div>
          {results.map((paper, index) => (
            <PaperCard
              key={index}
              paper={paper}
              onSave={handleSavePaper}
            />
          ))}
        </div>
      )}

      {!isLoading && results.length === 0 && query && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No results found. Try a different search query.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
