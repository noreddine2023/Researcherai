import axios from 'axios'

export interface SemanticScholarPaper {
  paperId: string
  title: string
  abstract?: string
  year?: number
  authors: Array<{ name: string }>
  venue?: string
  citationCount: number
  externalIds?: {
    DOI?: string
  }
  openAccessPdf?: {
    url: string
  }
}

export async function searchSemanticScholar(
  query: string,
  limit: number = 10
): Promise<SemanticScholarPaper[]> {
  try {
    const response = await axios.get(
      `https://api.semanticscholar.org/graph/v1/paper/search`,
      {
        params: {
          query,
          limit,
          fields: 'paperId,title,abstract,year,authors,venue,citationCount,externalIds,openAccessPdf',
        },
        headers: {
          'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY || '',
        },
      }
    )

    return response.data.data || []
  } catch (error) {
    console.error('Semantic Scholar API error:', error)
    return []
  }
}

export async function getPaperById(paperId: string): Promise<SemanticScholarPaper | null> {
  try {
    const response = await axios.get(
      `https://api.semanticscholar.org/graph/v1/paper/${paperId}`,
      {
        params: {
          fields: 'paperId,title,abstract,year,authors,venue,citationCount,externalIds,openAccessPdf',
        },
        headers: {
          'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY || '',
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Semantic Scholar API error:', error)
    return null
  }
}
