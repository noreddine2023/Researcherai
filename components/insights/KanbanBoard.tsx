'use client'

import { useState } from 'react'
import { Insight } from '@/types'
import { InsightCard } from './InsightCard'

const STATUSES = [
  { id: 'backlog', label: 'Backlog', color: 'bg-slate-100' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', label: 'Review', color: 'bg-amber-100' },
  { id: 'done', label: 'Done', color: 'bg-emerald-100' },
]

interface KanbanBoardProps {
  insights: Insight[]
  onUpdateInsight: (id: string, data: Partial<Insight>) => void
}

export function KanbanBoard({ insights, onUpdateInsight }: KanbanBoardProps) {
  const getInsightsByStatus = (status: string) => {
    return insights.filter(insight => insight.status === status)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATUSES.map((status) => (
        <div key={status.id} className="space-y-3">
          <div className={`p-3 rounded-lg ${status.color}`}>
            <h3 className="font-semibold text-sm">
              {status.label}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {getInsightsByStatus(status.id).length}
              </span>
            </h3>
          </div>
          <div className="space-y-3">
            {getInsightsByStatus(status.id).map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onUpdate={onUpdateInsight}
              />
            ))}
            {getInsightsByStatus(status.id).length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                No insights
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
