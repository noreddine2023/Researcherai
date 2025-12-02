import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const paperSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  abstract: z.string().optional(),
  publicationDate: z.string().optional(),
  venue: z.string().optional(),
  doi: z.string().optional(),
  citationCount: z.number().default(0),
  pdfUrl: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '20')
    const skip = (page - 1) * perPage

    const papers = await prisma.paper.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: {
        collections: {
          include: {
            collection: true,
          },
        },
      },
    })

    const total = await prisma.paper.count({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      papers,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error) {
    console.error('Papers GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = paperSchema.parse(body)

    const paper = await prisma.paper.create({
      data: {
        ...data,
        publicationDate: data.publicationDate ? new Date(data.publicationDate) : null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(paper)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Papers POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create paper' },
      { status: 500 }
    )
  }
}
