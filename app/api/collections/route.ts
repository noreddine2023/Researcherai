import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const collectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      include: {
        papers: {
          include: {
            paper: true,
          },
        },
        children: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ collections })
  } catch (error) {
    console.error('Collections GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
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
    const data = collectionSchema.parse(body)

    const collection = await prisma.collection.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(collection)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Collections POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Collection ID required' }, { status: 400 })
    }

    // Verify ownership
    const collection = await prisma.collection.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    await prisma.collection.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Collections DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    )
  }
}
