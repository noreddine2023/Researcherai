import axios from 'axios'

export interface CrossrefWork {
  DOI: string
  title?: string[]
  author?: Array<{
    given?: string
    family?: string
  }>
  'published-print'?: {
    'date-parts': number[][]
  }
  'container-title'?: string[]
  'is-referenced-by-count'?: number
  abstract?: string
  link?: Array<{
    URL: string
    'content-type': string
  }>
}

export async function searchCrossref(
  query: string,
  rows: number = 10
): Promise<CrossrefWork[]> {
  try {
    const response = await axios.get('https://api.crossref.org/works', {
      params: {
        query,
        rows,
      },
    })

    return response.data.message.items || []
  } catch (error) {
    console.error('Crossref API error:', error)
    return []
  }
}

export function normalizeCrossrefWork(work: CrossrefWork) {
  const authors = work.author?.map(a => 
    `${a.given || ''} ${a.family || ''}`.trim()
  ) || []

  const dateparts = work['published-print']?.['date-parts']?.[0]
  const publicationDate = dateparts 
    ? new Date(dateparts[0], (dateparts[1] || 1) - 1, dateparts[2] || 1)
    : undefined

  return {
    doi: work.DOI,
    title: work.title?.[0] || '',
    authors,
    abstract: work.abstract,
    publicationDate,
    venue: work['container-title']?.[0],
    citationCount: work['is-referenced-by-count'] || 0,
    pdfUrl: work.link?.find(l => l['content-type'] === 'application/pdf')?.URL,
  }
}
