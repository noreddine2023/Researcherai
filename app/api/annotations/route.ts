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
  paperId: z.string(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paperId = searchParams.get('paperId')

    const annotations = await prisma.annotation.findMany({
      where: { 
        userId: session.user.id,
        ...(paperId && { paperId }),
      },
      orderBy: { createdAt: 'desc' },
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = annotationSchema.parse(body)

    const annotation = await prisma.annotation.create({
      data: {
        ...data,
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
    
    console.error('Annotations POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    )
  }
}
