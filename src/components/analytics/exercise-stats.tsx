'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ExerciseStats as ExerciseStatsType } from '@/types/analytics'
import { Target, CheckCircle2, XCircle } from 'lucide-react'

interface ExerciseStatsProps {
  data: ExerciseStatsType
}

export function ExerciseStats({ data }: ExerciseStatsProps) {
  const chartData = [
    { name: 'Completed', value: data.completed, color: '#10b981' },
    { name: 'Declined', value: data.declined, color: '#ef4444' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-2 border-green-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent pointer-events-none" />
        
        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            <CardTitle>Exercise Engagement</CardTitle>
          </div>
          <CardDescription>
            Your exercise completion rate and history
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Completion Rate Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completion Rate</span>
              <motion.span
                key={data.completionRate}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold text-green-500"
              >
                {data.completionRate}%
              </motion.span>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ transformOrigin: 'left' }}
            >
              <Progress 
                value={data.completionRate} 
                className="h-3 bg-muted"
              />
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <p className="text-3xl font-bold text-green-500">{data.completed}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Declined</span>
              </div>
              <p className="text-3xl font-bold text-red-500">{data.declined}</p>
            </motion.div>
          </div>

          {/* Mini Bar Chart */}
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={70} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/95 backdrop-blur border rounded-lg shadow-lg p-2">
                          <p className="text-sm font-medium">
                            {payload[0].payload.name}: {payload[0].value}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
