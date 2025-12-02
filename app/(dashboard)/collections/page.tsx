import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen } from 'lucide-react'

export default function CollectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Collections</h2>
        <p className="text-muted-foreground">
          Organize your papers into collections
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
          <p className="text-muted-foreground">
            Create your first collection to organize papers
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
