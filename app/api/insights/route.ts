import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const insightSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  type: z.string().default('finding'),
  tags: z.array(z.string()).default([]),
  status: z.string().default('backlog'),
  paperId: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const insights = await prisma.insightCard.findMany({
      where: { 
        userId: session.user.id,
        ...(status && { status }),
      },
      include: {
        paper: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Insights GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
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
    const data = insightSchema.parse(body)

    const insight = await prisma.insightCard.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(insight)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Insights POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create insight' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Insight ID required' }, { status: 400 })
    }

    // Verify ownership
    const insight = await prisma.insightCard.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!insight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 })
    }

    const updated = await prisma.insightCard.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Insights PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update insight' },
      { status: 500 }
    )
  }
}
