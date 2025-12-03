import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const paper = await prisma.paper.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      include: {
        collections: {
          include: {
            collection: true,
          },
        },
        annotations: true,
        insights: true,
      },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    return NextResponse.json(paper)
  } catch (error) {
    console.error('Paper GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch paper' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify ownership
    const existingPaper = await prisma.paper.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!existingPaper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    const paper = await prisma.paper.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(paper)
  } catch (error) {
    console.error('Paper PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update paper' },
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

    // Verify ownership
    const existingPaper = await prisma.paper.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!existingPaper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    await prisma.paper.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Paper DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete paper' },
      { status: 500 }
    )
  }
}
