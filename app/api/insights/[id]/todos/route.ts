import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const todoSchema = z.object({
  text: z.string().min(1),
  completed: z.boolean().optional().default(false),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify insight ownership
    const insight = await prisma.insightCard.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!insight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 })
    }

    const todos = await prisma.insightTodo.findMany({
      where: { insightId: params.id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ todos })
  } catch (error) {
    console.error('Todos GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify insight ownership
    const insight = await prisma.insightCard.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!insight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 })
    }

    const body = await request.json()
    const data = todoSchema.parse(body)

    const todo = await prisma.insightTodo.create({
      data: {
        ...data,
        insightId: params.id,
      },
    })

    return NextResponse.json(todo)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Todos POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create todo' },
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

    const { todoId, ...updates } = await request.json()

    if (!todoId) {
      return NextResponse.json({ error: 'Todo ID required' }, { status: 400 })
    }

    // Verify insight ownership
    const todo = await prisma.insightTodo.findFirst({
      where: { id: todoId, insightId: params.id },
      include: { insight: true },
    })

    if (!todo || todo.insight.userId !== session.user.id) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    const updated = await prisma.insightTodo.update({
      where: { id: todoId },
      data: updates,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Todos PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update todo' },
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
    const todoId = searchParams.get('todoId')

    if (!todoId) {
      return NextResponse.json({ error: 'Todo ID required' }, { status: 400 })
    }

    // Verify insight ownership
    const todo = await prisma.insightTodo.findFirst({
      where: { id: todoId, insightId: params.id },
      include: { insight: true },
    })

    if (!todo || todo.insight.userId !== session.user.id) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    await prisma.insightTodo.delete({
      where: { id: todoId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Todos DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    )
  }
}
