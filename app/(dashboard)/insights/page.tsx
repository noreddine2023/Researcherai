import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Research Insights</h2>
        <p className="text-muted-foreground">
          Manage your research insights with a Kanban board
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
          <p className="text-muted-foreground">
            Start capturing research insights from your papers
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
