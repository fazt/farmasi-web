'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'

interface TrendData {
  month: string
  count: number
}

interface TrendChartProps {
  data: TrendData[]
  title: string
  value: number | string
  color?: string
  dataKey: string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
  }
}

export function TrendChart({ 
  data, 
  title, 
  value, 
  color = '#ffffff', 
  dataKey, 
  trend
}: TrendChartProps) {
  // Calculate trend if not provided
  const calculatedTrend = trend || (() => {
    if (data.length < 2) return { direction: 'neutral' as const, percentage: 0 }
    
    const current = data[data.length - 1]?.count || 0
    const previous = data[data.length - 2]?.count || 0
    
    if (previous === 0) return { direction: 'neutral' as const, percentage: 0 }
    
    const percentage = ((current - previous) / previous) * 100
    const direction = percentage > 0 ? 'up' as const : percentage < 0 ? 'down' as const : 'neutral' as const
    
    return { direction, percentage: Math.abs(percentage) }
  })()

  // Generate smooth curve data points for better visual
  const generateSmoothData = (originalData: TrendData[]) => {
    if (originalData.length === 0) return []
    
    // Create more data points for smoother curve
    const smoothData = []
    for (let i = 0; i < originalData.length - 1; i++) {
      const current = originalData[i]
      const next = originalData[i + 1]
      
      smoothData.push(current)
      
      // Add interpolated points
      for (let j = 1; j <= 3; j++) {
        const ratio = j / 4
        const interpolatedCount = current.count + (next.count - current.count) * ratio
        smoothData.push({
          month: `${current.month}-${j}`,
          count: interpolatedCount
        })
      }
    }
    smoothData.push(originalData[originalData.length - 1])
    return smoothData
  }

  const smoothData = generateSmoothData(data)

  return (
    <div className="relative bg-card border rounded-lg p-4 overflow-hidden shadow-sm">
      {/* Theme-aware background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-lg" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-sm text-muted-foreground font-medium">{title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{value}</span>
              {calculatedTrend.direction !== 'neutral' && (
                <span className={`text-sm font-medium ${
                  calculatedTrend.direction === 'up' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {calculatedTrend.direction === 'up' ? '+' : '-'}{calculatedTrend.percentage.toFixed(0)}% from last month
                </span>
              )}
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
          >
            View More
          </Button>
        </div>

        {/* Chart */}
        <div className="h-20 -mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={smoothData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Line 
                type="natural" 
                dataKey="count" 
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                opacity={0.8}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}