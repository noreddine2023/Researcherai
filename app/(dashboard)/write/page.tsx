import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function WritePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Writing Assistant</h2>
        <p className="text-muted-foreground">
          Write with AI assistance and manage your documents
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
          <p className="text-muted-foreground">
            Create your first document to start writing
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
