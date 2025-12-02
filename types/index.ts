export interface Paper {
  id: string
  title: string
  authors: string[]
  abstract?: string
  publicationDate?: Date
  venue?: string
  doi?: string
  citationCount: number
  pdfUrl?: string
  summary?: string
  methodology?: string
  findings?: string
  limitations?: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  parentId?: string
  paperCount?: number
}

export interface InsightCard {
  id: string
  title: string
  content: string
  type: string
  tags: string[]
  status: string
  paperId?: string
}

export interface Annotation {
  id: string
  content: string
  highlight?: string
  color: string
  pageNumber?: number
  paperId: string
}

export interface SearchFilters {
  year?: number
  venue?: string
  citationMin?: number
  citationMax?: number
  sortBy?: 'relevance' | 'citations' | 'date'
}

export interface SearchResult {
  papers: Paper[]
  total: number
  page: number
  perPage: number
}
