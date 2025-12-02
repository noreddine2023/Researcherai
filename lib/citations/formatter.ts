import { Paper } from '@/types'

export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'vancouver'

export function formatCitation(paper: Partial<Paper>, style: CitationStyle = 'apa'): string {
  switch (style) {
    case 'apa':
      return formatAPA(paper)
    case 'mla':
      return formatMLA(paper)
    case 'chicago':
      return formatChicago(paper)
    case 'harvard':
      return formatHarvard(paper)
    case 'ieee':
      return formatIEEE(paper)
    case 'vancouver':
      return formatVancouver(paper)
    default:
      return formatAPA(paper)
  }
}

function formatAPA(paper: Partial<Paper>): string {
  const authors = formatAuthorsAPA(paper.authors || [])
  const year = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : 'n.d.'
  const title = paper.title || 'Untitled'
  const venue = paper.venue || ''
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : ''

  return `${authors} (${year}). ${title}. ${venue ? `${venue}. ` : ''}${doi}`
}

function formatMLA(paper: Partial<Paper>): string {
  const authors = formatAuthorsMLA(paper.authors || [])
  const title = paper.title || 'Untitled'
  const venue = paper.venue || ''
  const year = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : 'n.d.'

  return `${authors}. "${title}." ${venue ? `${venue}, ` : ''}${year}.`
}

function formatChicago(paper: Partial<Paper>): string {
  const authors = formatAuthorsChicago(paper.authors || [])
  const title = paper.title || 'Untitled'
  const venue = paper.venue || ''
  const year = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : 'n.d.'

  return `${authors}. "${title}." ${venue ? `${venue} ` : ''}(${year}).`
}

function formatHarvard(paper: Partial<Paper>): string {
  return formatAPA(paper) // Harvard is similar to APA
}

function formatIEEE(paper: Partial<Paper>): string {
  const authors = formatAuthorsIEEE(paper.authors || [])
  const title = paper.title || 'Untitled'
  const venue = paper.venue || ''
  const year = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : 'n.d.'

  return `${authors}, "${title}," ${venue ? `${venue}, ` : ''}${year}.`
}

function formatVancouver(paper: Partial<Paper>): string {
  const authors = formatAuthorsVancouver(paper.authors || [])
  const title = paper.title || 'Untitled'
  const venue = paper.venue || ''
  const year = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : 'n.d.'

  return `${authors}. ${title}. ${venue ? `${venue}. ` : ''}${year}.`
}

// Author formatting helpers
function formatAuthorsAPA(authors: string[]): string {
  if (authors.length === 0) return 'Unknown'
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`
  return `${authors[0]} et al.`
}

function formatAuthorsMLA(authors: string[]): string {
  if (authors.length === 0) return 'Unknown'
  return authors[0]
}

function formatAuthorsChicago(authors: string[]): string {
  if (authors.length === 0) return 'Unknown'
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`
  return `${authors[0]} et al.`
}

function formatAuthorsIEEE(authors: string[]): string {
  if (authors.length === 0) return 'Unknown'
  if (authors.length <= 3) return authors.join(', ')
  return `${authors[0]} et al.`
}

function formatAuthorsVancouver(authors: string[]): string {
  if (authors.length === 0) return 'Unknown'
  if (authors.length <= 6) return authors.join(', ')
  return `${authors.slice(0, 6).join(', ')}, et al.`
}

export function generateBibTeX(paper: Partial<Paper>): string {
  const id = paper.id || 'unknown'
  const title = paper.title || 'Untitled'
  const authors = (paper.authors || []).join(' and ')
  const year = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : ''
  const venue = paper.venue || ''
  const doi = paper.doi || ''

  return `@article{${id},
  title={${title}},
  author={${authors}},
  journal={${venue}},
  year={${year}},
  doi={${doi}}
}`
}

export function generateRIS(paper: Partial<Paper>): string {
  const title = paper.title || 'Untitled'
  const authors = paper.authors || []
  const year = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : ''
  const venue = paper.venue || ''
  const doi = paper.doi || ''

  return `TY  - JOUR
TI  - ${title}
${authors.map(a => `AU  - ${a}`).join('\n')}
PY  - ${year}
JO  - ${venue}
DO  - ${doi}
ER  -`
}
