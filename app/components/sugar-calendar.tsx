'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DailyLog } from '@/lib/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'

interface SugarCalendarProps {
  logs: DailyLog[]
}

export default function SugarCalendar({ logs }: SugarCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }
  
  // Get sugar intake for a specific day
  const getSugarIntake = (day: Date) => {
    const log = logs.find(log => isSameDay(new Date(log.date), day))
    return log ? log.sugar_intake_grams : null
  }
  
  // Determine color based on sugar intake
  const getSugarColor = (sugarIntake: number | null) => {
    if (sugarIntake === null) return 'bg-gray-100'
    if (sugarIntake === 0) return 'bg-green-100'
    if (sugarIntake < 10) return 'bg-green-300'
    if (sugarIntake < 25) return 'bg-yellow-300'
    if (sugarIntake < 50) return 'bg-orange-300'
    return 'bg-red-300'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sugar Intake Calendar</CardTitle>
          <div className="flex space-x-2">
            <button 
              onClick={previousMonth}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              &lt;
            </button>
            <span className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button 
              onClick={nextMonth}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              &gt;
            </button>
          </div>
        </div>
        <CardDescription>
          Track your daily sugar intake over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs font-medium py-1">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-start-${index}`} className="h-12 rounded-md"></div>
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map((day) => {
            const sugarIntake = getSugarIntake(day)
            const isToday = isSameDay(day, new Date())
            
            return (
              <div 
                key={day.toISOString()}
                className={cn(
                  "h-12 rounded-md flex flex-col items-center justify-center relative",
                  getSugarColor(sugarIntake),
                  isToday && "ring-2 ring-blue-500"
                )}
              >
                <span className={cn(
                  "text-xs font-medium",
                  isToday && "font-bold"
                )}>
                  {format(day, 'd')}
                </span>
                {sugarIntake !== null && (
                  <span className="text-xs">
                    {sugarIntake}g
                  </span>
                )}
              </div>
            )
          })}
          
          {/* Empty cells for days after the end of the month */}
          {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
            <div key={`empty-end-${index}`} className="h-12 rounded-md"></div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-300"></div>
            <span className="text-xs">&lt;10g</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
            <span className="text-xs">&lt;25g</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-orange-300"></div>
            <span className="text-xs">&lt;50g</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-300"></div>
            <span className="text-xs">&gt;50g</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
