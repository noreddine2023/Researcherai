import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { formatCitation, generateBibTeX, generateRIS, CitationStyle } from '@/lib/citations/formatter'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paperId, style, format } = await request.json()

    if (!paperId) {
      return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 })
    }

    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    // Convert null to undefined for compatibility with Paper type
    const paperData = {
      ...paper,
      abstract: paper.abstract || undefined,
      venue: paper.venue || undefined,
      doi: paper.doi || undefined,
      pdfUrl: paper.pdfUrl || undefined,
      summary: paper.summary || undefined,
      methodology: paper.methodology || undefined,
      findings: paper.findings || undefined,
      limitations: paper.limitations || undefined,
      publicationDate: paper.publicationDate || undefined,
    }

    let result: string

    if (format === 'bibtex') {
      result = generateBibTeX(paperData)
    } else if (format === 'ris') {
      result = generateRIS(paperData)
    } else {
      result = formatCitation(paperData, style as CitationStyle || 'apa')
      
      // Save the citation
      await prisma.citation.create({
        data: {
          paperId: paper.id,
          style: style || 'apa',
          formatted: result,
        },
      })
    }

    return NextResponse.json({ citation: result })
  } catch (error) {
    console.error('Citations API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate citation' },
      { status: 500 }
    )
  }
}
