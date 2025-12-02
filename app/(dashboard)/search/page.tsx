'use client'

import { useState } from 'react'
import { Search as SearchIcon, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Search Papers</h2>
        <p className="text-muted-foreground">
          Search across 200M+ academic papers
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
            <Button type="button" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Found {results.length} results
          </div>
          {results.map((paper, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{paper.title}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {paper.authors?.slice(0, 3).join(', ')}
                  {paper.authors?.length > 3 && ' et al.'}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {paper.abstract?.substring(0, 200)}
                  {paper.abstract?.length > 200 && '...'}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {paper.venue && <span>{paper.venue}</span>}
                  {paper.publicationDate && (
                    <span>{new Date(paper.publicationDate).getFullYear()}</span>
                  )}
                  <span>{paper.citationCount} citations</span>
                  {paper.source && <span className="text-blue-600">{paper.source}</span>}
                </div>
              </CardContent>
            </Card>
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
