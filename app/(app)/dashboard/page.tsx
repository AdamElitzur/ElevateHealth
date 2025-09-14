import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserProfile } from '@/app/actions/user-profile'
import { getDailyLogs } from '@/app/actions/daily-log'
import { format, addDays, differenceInDays } from 'date-fns'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarCheck, Candy, LineChart, TrendingDown } from 'lucide-react'

export default async function DashboardPage() {
  const userProfile = await getUserProfile()
  const dailyLogs = await getDailyLogs()
  
  // Calculate challenge progress
  const startDate = userProfile?.challenge_start_date 
    ? new Date(userProfile.challenge_start_date) 
    : new Date()
  const endDate = addDays(startDate, 14) // 2-week challenge
  const today = new Date()
  const totalDays = 14
  const daysElapsed = Math.min(differenceInDays(today, startDate) + 1, totalDays)
  const progressPercentage = Math.round((daysElapsed / totalDays) * 100)
  
  // Calculate stats
  const sugarIntakeTotal = dailyLogs.reduce((sum, log) => sum + log.sugar_intake_grams, 0)
  const sugarIntakeAvg = dailyLogs.length > 0 ? Math.round(sugarIntakeTotal / dailyLogs.length) : 0
  const latestLog = dailyLogs[0] // Logs are ordered by date desc
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/dashboard/log">
          <Button>Log Today</Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Challenge Progress</CardTitle>
          <CardDescription>
            {daysElapsed} of {totalDays} days completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Started: {format(startDate, 'MMM d, yyyy')}</span>
              <span>Ends: {format(endDate, 'MMM d, yyyy')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Logged</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              out of {daysElapsed} days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sugar Intake</CardTitle>
            <Candy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sugarIntakeAvg}g</div>
            <p className="text-xs text-muted-foreground">
              per day
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Sugar Intake</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestLog ? `${latestLog.sugar_intake_grams}g` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestLog ? format(new Date(latestLog.date), 'MMM d, yyyy') : 'No logs yet'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">View Progress</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-4">
            <Link href="/dashboard/progress">
              <Button variant="outline">See Details</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your recent logs and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyLogs.length > 0 ? (
            <div className="space-y-4">
              {dailyLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{format(new Date(log.date), 'EEEE, MMM d')}</p>
                    <p className="text-sm text-muted-foreground">
                      Sugar: {log.sugar_intake_grams}g
                      {log.weight_kg && ` • Weight: ${log.weight_kg}kg`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {log.mood_rating && (
                      <div className="text-sm">
                        Mood: {log.mood_rating}/10
                      </div>
                    )}
                    {log.energy_rating && (
                      <div className="text-sm">
                        Energy: {log.energy_rating}/10
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No logs yet. Start tracking your progress!</p>
              <div className="mt-4">
                <Link href="/dashboard/log">
                  <Button>Add First Log</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
