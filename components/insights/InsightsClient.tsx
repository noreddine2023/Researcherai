'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { KanbanBoard } from './KanbanBoard'
import { Insight } from '@/types'

interface InsightsClientProps {
  initialInsights: Insight[]
}

export function InsightsClient({ initialInsights }: InsightsClientProps) {
  const [insights, setInsights] = useState<Insight[]>(initialInsights)

  const handleUpdateInsight = (id: string, data: Partial<Insight>) => {
    setInsights(prevInsights =>
      prevInsights.map(insight =>
        insight.id === id ? { ...insight, ...data } : insight
      )
    )
    
    // TODO: Make API call to update insight
    // fetch(`/api/insights/${id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Research Insights</h2>
          <p className="text-muted-foreground">
            Manage your research insights with a Kanban board
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Insight
        </Button>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
          <p className="text-muted-foreground mb-4">
            Start capturing research insights from your papers
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create First Insight
          </Button>
        </div>
      ) : (
        <KanbanBoard insights={insights} onUpdateInsight={handleUpdateInsight} />
      )}
    </div>
  )
}
