import axios from 'axios'

export interface OpenAlexWork {
  id: string
  title: string
  display_name: string
  publication_year?: number
  authorships: Array<{
    author: {
      display_name: string
    }
  }>
  primary_location?: {
    source?: {
      display_name: string
    }
  }
  cited_by_count: number
  doi?: string
  abstract_inverted_index?: Record<string, number[]>
  open_access?: {
    oa_url?: string
  }
}

function reconstructAbstract(invertedIndex?: Record<string, number[]>): string | undefined {
  if (!invertedIndex) return undefined
  
  const words: [string, number][] = []
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push([word, pos])
    }
  }
  
  words.sort((a, b) => a[1] - b[1])
  return words.map(w => w[0]).join(' ')
}

export async function searchOpenAlex(
  query: string,
  perPage: number = 10
): Promise<OpenAlexWork[]> {
  try {
    const response = await axios.get('https://api.openalex.org/works', {
      params: {
        search: query,
        per_page: perPage,
      },
      headers: {
        'User-Agent': `ResearchFlow (mailto:${process.env.OPENALEX_EMAIL || 'contact@example.com'})`,
      },
    })

    return response.data.results || []
  } catch (error) {
    console.error('OpenAlex API error:', error)
    return []
  }
}

export function normalizeOpenAlexWork(work: OpenAlexWork) {
  return {
    id: work.id,
    title: work.display_name || work.title,
    authors: work.authorships.map(a => a.author.display_name),
    abstract: reconstructAbstract(work.abstract_inverted_index),
    publicationDate: work.publication_year ? new Date(work.publication_year, 0, 1) : undefined,
    venue: work.primary_location?.source?.display_name,
    doi: work.doi,
    citationCount: work.cited_by_count,
    pdfUrl: work.open_access?.oa_url,
  }
}
