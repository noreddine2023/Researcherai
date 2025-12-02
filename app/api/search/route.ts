import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { searchSemanticScholar } from '@/lib/api/semantic-scholar'
import { searchOpenAlex, normalizeOpenAlexWork } from '@/lib/api/openalex'
import { searchCrossref, normalizeCrossrefWork } from '@/lib/api/crossref'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const source = searchParams.get('source') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    let results: any[] = []

    if (source === 'semantic-scholar' || source === 'all') {
      const semanticResults = await searchSemanticScholar(query, limit)
      results = [
        ...results,
        ...semanticResults.map(paper => ({
          id: paper.paperId,
          title: paper.title,
          authors: paper.authors.map(a => a.name),
          abstract: paper.abstract,
          publicationDate: paper.year ? new Date(paper.year, 0, 1) : null,
          venue: paper.venue,
          doi: paper.externalIds?.DOI,
          citationCount: paper.citationCount,
          pdfUrl: paper.openAccessPdf?.url,
          source: 'Semantic Scholar',
        })),
      ]
    }

    if (source === 'openalex' || source === 'all') {
      const openAlexResults = await searchOpenAlex(query, limit)
      results = [
        ...results,
        ...openAlexResults.map(work => ({
          ...normalizeOpenAlexWork(work),
          source: 'OpenAlex',
        })),
      ]
    }

    if (source === 'crossref' || source === 'all') {
      const crossrefResults = await searchCrossref(query, limit)
      results = [
        ...results,
        ...crossrefResults.map(work => ({
          id: work.DOI,
          ...normalizeCrossrefWork(work),
          source: 'Crossref',
        })),
      ]
    }

    // Remove duplicates based on DOI or title
    const uniqueResults = results.reduce((acc, paper) => {
      const key = paper.doi || paper.title
      if (!acc.some((p: any) => (p.doi === paper.doi && paper.doi) || p.title === paper.title)) {
        acc.push(paper)
      }
      return acc
    }, [] as any[])

    return NextResponse.json({
      results: uniqueResults.slice(0, limit * 2),
      total: uniqueResults.length,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search papers' },
      { status: 500 }
    )
  }
}
