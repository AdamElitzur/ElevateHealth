'use client'

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface ChartData {
  date: string
  value: number | null
}

interface ProgressChartsProps {
  data: ChartData[]
  dataKey: string
  name: string
  color: string
  yAxisDomain: Array<number | string>
}

export default function ProgressCharts({ 
  data, 
  dataKey, 
  name, 
  color,
  yAxisDomain 
}: ProgressChartsProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }} 
          tickMargin={10}
        />
        <YAxis 
          domain={yAxisDomain} 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--background)', 
            borderColor: 'var(--border)',
            borderRadius: '0.375rem',
          }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
