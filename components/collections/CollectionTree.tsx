'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CollectionNode {
  id: string
  name: string
  description: string | null
  parentId: string | null
  paperCount: number
  children: CollectionNode[]
}

interface CollectionTreeProps {
  collections: CollectionNode[]
  selectedId?: string
  onSelect?: (id: string) => void
}

function TreeNode({
  node,
  level = 0,
  selectedId,
  onSelect,
}: {
  node: CollectionNode
  level?: number
  selectedId?: string
  onSelect?: (id: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-accent transition ${
          selectedId === node.id ? 'bg-accent' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onSelect?.(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}
        {isExpanded && hasChildren ? (
          <FolderOpen className="w-4 h-4 text-blue-600" />
        ) : (
          <Folder className="w-4 h-4 text-blue-600" />
        )}
        <Link href={`/collections/${node.id}`} className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm truncate">{node.name}</span>
            <span className="text-xs text-muted-foreground">{node.paperCount}</span>
          </div>
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CollectionTree({ collections, selectedId, onSelect }: CollectionTreeProps) {
  if (collections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No collections yet.</p>
        <p className="text-xs mt-1">Create a collection to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {collections.map((collection) => (
        <TreeNode
          key={collection.id}
          node={collection}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
