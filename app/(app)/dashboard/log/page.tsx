import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDailyLog } from '@/app/actions/daily-log'
import { format } from 'date-fns'
import DailyLogForm from './daily-log-form'

export default async function DailyLogPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const existingLog = await getDailyLog(today)
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Daily Log</h1>
        <p className="text-muted-foreground">
          Track your progress for {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Log</CardTitle>
          <CardDescription>
            Record your sugar intake, weight, and how you&apos;re feeling today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DailyLogForm existingLog={existingLog} />
        </CardContent>
      </Card>
    </div>
  )
}
