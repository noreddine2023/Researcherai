import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const addPaperSchema = z.object({
  paperId: z.string(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify collection ownership
    const collection = await prisma.collection.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    const body = await request.json()
    const data = addPaperSchema.parse(body)

    // Verify paper ownership
    const paper = await prisma.paper.findFirst({
      where: { id: data.paperId, userId: session.user.id },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    // Check if paper is already in collection
    const existing = await prisma.collectionPaper.findUnique({
      where: {
        collectionId_paperId: {
          collectionId: params.id,
          paperId: data.paperId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Paper already in collection' },
        { status: 400 }
      )
    }

    // Add paper to collection
    const collectionPaper = await prisma.collectionPaper.create({
      data: {
        collectionId: params.id,
        paperId: data.paperId,
        notes: data.notes,
        tags: data.tags || [],
      },
      include: {
        paper: true,
        collection: true,
      },
    })

    return NextResponse.json(collectionPaper)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Add paper to collection error:', error)
    return NextResponse.json(
      { error: 'Failed to add paper to collection' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paperId = searchParams.get('paperId')

    if (!paperId) {
      return NextResponse.json({ error: 'Paper ID required' }, { status: 400 })
    }

    // Verify collection ownership
    const collection = await prisma.collection.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    // Remove paper from collection
    await prisma.collectionPaper.delete({
      where: {
        collectionId_paperId: {
          collectionId: params.id,
          paperId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove paper from collection error:', error)
    return NextResponse.json(
      { error: 'Failed to remove paper from collection' },
      { status: 500 }
    )
  }
}
