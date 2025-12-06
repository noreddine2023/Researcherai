'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  icon: LucideIcon
  color: string
}

export function StatCard({ label, value, change, icon: Icon, color }: StatCardProps) {
  const isPositive = change?.startsWith('+')
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'} font-medium mt-1`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
