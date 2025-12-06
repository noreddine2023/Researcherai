'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Brain, Clock, Target } from 'lucide-react'

// Map of icon names to icon components
const iconMap = {
    BookOpen: BookOpen,
    Brain: Brain,
    Clock: Clock,
    Target: Target,
}

type IconName = keyof typeof iconMap

interface StatCardProps {
    label: string
    value: string | number
    change?: string
    iconName: IconName
    color: string
}

export function StatCard({ label, value, change, iconName, color }: StatCardProps) {
    const isPositive = change?.startsWith('+')
    const Icon = iconMap[iconName]

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