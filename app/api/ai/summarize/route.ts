import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { summarizePaper } from '@/lib/ai/summarize'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, abstract, fullText } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const result = await summarizePaper(title, abstract, fullText)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Summarize API error:', error)
    return NextResponse.json(
      { error: 'Failed to summarize paper' },
      { status: 500 }
    )
  }
}
