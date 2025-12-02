'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Filter } from 'lucide-react'

interface SearchFiltersProps {
  onFilterChange?: (filters: any) => void
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    yearFrom: '',
    yearTo: '',
    minCitations: '',
    venue: '',
  })

  const handleApply = () => {
    onFilterChange?.(filters)
    setIsOpen(false)
  }

  const handleReset = () => {
    const resetFilters = {
      yearFrom: '',
      yearTo: '',
      minCitations: '',
      venue: '',
    }
    setFilters(resetFilters)
    onFilterChange?.(resetFilters)
  }

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Filter className="w-4 h-4 mr-2" />
        Filters
      </Button>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearFrom">Year From</Label>
              <Input
                id="yearFrom"
                type="number"
                placeholder="2000"
                value={filters.yearFrom}
                onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearTo">Year To</Label>
              <Input
                id="yearTo"
                type="number"
                placeholder="2024"
                value={filters.yearTo}
                onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minCitations">Minimum Citations</Label>
            <Input
              id="minCitations"
              type="number"
              placeholder="10"
              value={filters.minCitations}
              onChange={(e) => setFilters({ ...filters, minCitations: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              placeholder="e.g., Nature, Science"
              value={filters.venue}
              onChange={(e) => setFilters({ ...filters, venue: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
