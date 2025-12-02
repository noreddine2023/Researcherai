import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Profile</h4>
              <p className="text-sm text-muted-foreground">
                Update your profile information
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">API Keys</h4>
              <p className="text-sm text-muted-foreground">
                Configure your API keys for external services
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Preferences</h4>
              <p className="text-sm text-muted-foreground">
                Customize your experience
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
