import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const annotationSchema = z.object({
  content: z.string(),
  highlight: z.string().optional(),
  color: z.string().default('yellow'),
  pageNumber: z.number().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  startOffset: z.number().optional(),
  endOffset: z.number().optional(),
  type: z.enum(['highlight', 'note', 'drawing', 'comment', 'underline', 'strikethrough']).default('highlight'),
  drawingData: z.string().optional(),
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

    // Verify paper ownership
    const paper = await prisma.paper.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    const body = await request.json()
    const data = annotationSchema.parse(body)

    const annotation = await prisma.annotation.create({
      data: {
        ...data,
        paperId: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(annotation)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Annotation POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify paper ownership
    const paper = await prisma.paper.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    const annotations = await prisma.annotation.findMany({
      where: { 
        paperId: params.id,
        userId: session.user.id,
      },
      orderBy: [
        { pageNumber: 'asc' },
        { createdAt: 'asc' }
      ],
    })

    return NextResponse.json({ annotations })
  } catch (error) {
    console.error('Annotations GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    )
  }
}
