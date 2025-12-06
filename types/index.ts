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
  tags?: string[]
  externalUrl?: string
  year?: number
  status?: 'read' | 'unread' | 'reading'
}

export interface Collection {
  id: string
  name: string
  description?: string
  color?: string
  parentId?: string
  paperCount?: number
  count?: number
  subCollections?: Collection[]
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

export interface InsightComment {
  id: string
  user: string
  content: string
  timestamp: string
  userId?: string
}

export interface InsightTodo {
  id: string
  text: string
  completed: boolean
}

export interface Insight {
  id: string
  title: string
  content: string
  type: 'finding' | 'methodology' | 'limitation' | 'idea'
  status: 'backlog' | 'in-progress' | 'review' | 'done'
  paperId?: string
  comments?: InsightComment[]
  todos?: InsightTodo[]
  tags?: string[]
}

export interface Activity {
  id: string
  user: string
  action: string
  target: string
  time: string
  type: 'upload' | 'ai' | 'collection' | 'insight'
}

export type BlockType = 'h1' | 'h2' | 'p' | 'quote' | 'image' | 'list'

export interface EditorBlock {
  id: string
  type: BlockType
  content: string
}

export interface Document {
  id: string
  title: string
  updatedAt: string
  blocks?: EditorBlock[]
  content?: string
}

export type NavView = 'landing' | 'dashboard' | 'search' | 'library' | 'paper' | 'pdf' | 'collections' | 'insights' | 'write' | 'settings' | 'papers'

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
