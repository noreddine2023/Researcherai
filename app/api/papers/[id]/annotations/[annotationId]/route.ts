import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const annotationUpdateSchema = z.object({
  content: z.string().optional(),
  highlight: z.string().optional(),
  color: z.string().optional(),
  pageNumber: z.number().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  startOffset: z.number().optional(),
  endOffset: z.number().optional(),
  type: z.enum(['highlight', 'note', 'drawing', 'comment', 'underline', 'strikethrough']).optional(),
  drawingData: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; annotationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify annotation ownership
    const annotation = await prisma.annotation.findFirst({
      where: {
        id: params.annotationId,
        paperId: params.id,
        userId: session.user.id,
      },
    })

    if (!annotation) {
      return NextResponse.json({ error: 'Annotation not found' }, { status: 404 })
    }

    const body = await request.json()
    const data = annotationUpdateSchema.parse(body)

    const updatedAnnotation = await prisma.annotation.update({
      where: { id: params.annotationId },
      data,
    })

    return NextResponse.json(updatedAnnotation)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Annotation PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update annotation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; annotationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify annotation ownership
    const annotation = await prisma.annotation.findFirst({
      where: {
        id: params.annotationId,
        paperId: params.id,
        userId: session.user.id,
      },
    })

    if (!annotation) {
      return NextResponse.json({ error: 'Annotation not found' }, { status: 404 })
    }

    await prisma.annotation.delete({
      where: { id: params.annotationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Annotation DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete annotation' },
      { status: 500 }
    )
  }
}
