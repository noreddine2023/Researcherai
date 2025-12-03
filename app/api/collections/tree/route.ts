import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface CollectionNode {
  id: string
  name: string
  description: string | null
  parentId: string | null
  paperCount: number
  children: CollectionNode[]
  createdAt: Date
  updatedAt: Date
}

function buildCollectionTree(collections: any[]): CollectionNode[] {
  const collectionMap = new Map<string, CollectionNode>()
  const rootCollections: CollectionNode[] = []

  // First pass: Create nodes
  collections.forEach(collection => {
    collectionMap.set(collection.id, {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      parentId: collection.parentId,
      paperCount: collection._count?.papers || 0,
      children: [],
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    })
  })

  // Second pass: Build tree structure
  collections.forEach(collection => {
    const node = collectionMap.get(collection.id)!
    
    if (collection.parentId) {
      const parent = collectionMap.get(collection.parentId)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      rootCollections.push(node)
    }
  })

  return rootCollections
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { papers: true }
        }
      },
      orderBy: { name: 'asc' },
    })

    const tree = buildCollectionTree(collections)

    return NextResponse.json({ tree })
  } catch (error) {
    console.error('Collections tree GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection tree' },
      { status: 500 }
    )
  }
}
