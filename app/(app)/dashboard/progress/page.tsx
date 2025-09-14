import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDailyLogs } from '@/app/actions/daily-log'
import { getUserProfile } from '@/app/actions/user-profile'
import { format, subDays } from 'date-fns'
import ProgressCharts from './progress-charts'

export default async function ProgressPage() {
  // Get logs from the past 14 days
  const endDate = format(new Date(), 'yyyy-MM-dd')
  const startDate = format(subDays(new Date(), 13), 'yyyy-MM-dd')
  const dailyLogs = await getDailyLogs(startDate, endDate)
  const userProfile = await getUserProfile()
  
  // Prepare data for charts
  const sugarData = dailyLogs.map(log => ({
    date: format(new Date(log.date), 'MMM d'),
    value: log.sugar_intake_grams
  })).reverse()
  
  const weightData = dailyLogs
    .filter(log => log.weight_kg !== null)
    .map(log => ({
      date: format(new Date(log.date), 'MMM d'),
      value: log.weight_kg
    })).reverse()
  
  const moodData = dailyLogs
    .filter(log => log.mood_rating !== null)
    .map(log => ({
      date: format(new Date(log.date), 'MMM d'),
      value: log.mood_rating
    })).reverse()
  
  const energyData = dailyLogs
    .filter(log => log.energy_rating !== null)
    .map(log => ({
      date: format(new Date(log.date), 'MMM d'),
      value: log.energy_rating
    })).reverse()
  
  const cravingsData = dailyLogs
    .filter(log => log.cravings_rating !== null)
    .map(log => ({
      date: format(new Date(log.date), 'MMM d'),
      value: log.cravings_rating
    })).reverse()
  
  const sleepData = dailyLogs
    .filter(log => log.sleep_rating !== null)
    .map(log => ({
      date: format(new Date(log.date), 'MMM d'),
      value: log.sleep_rating
    })).reverse()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your progress over the 2-week no sugar challenge
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sugar Intake</CardTitle>
          <CardDescription>
            Daily sugar consumption in grams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ProgressCharts 
              data={sugarData} 
              dataKey="value" 
              name="Sugar (g)" 
              color="#ef4444" 
              yAxisDomain={[0, 'auto']}
            />
          </div>
        </CardContent>
      </Card>
      
      {weightData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weight</CardTitle>
            <CardDescription>
              Daily weight measurements in kg
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ProgressCharts 
                data={weightData} 
                dataKey="value" 
                name="Weight (kg)" 
                color="#3b82f6" 
                yAxisDomain={['auto', 'auto']}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {moodData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mood Rating</CardTitle>
              <CardDescription>
                How you felt each day (1-10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ProgressCharts 
                  data={moodData} 
                  dataKey="value" 
                  name="Mood" 
                  color="#10b981" 
                  yAxisDomain={[1, 10]}
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {energyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Energy Level</CardTitle>
              <CardDescription>
                Your energy levels each day (1-10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ProgressCharts 
                  data={energyData} 
                  dataKey="value" 
                  name="Energy" 
                  color="#f59e0b" 
                  yAxisDomain={[1, 10]}
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {cravingsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sugar Cravings</CardTitle>
              <CardDescription>
                Intensity of sugar cravings (1-10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ProgressCharts 
                  data={cravingsData} 
                  dataKey="value" 
                  name="Cravings" 
                  color="#8b5cf6" 
                  yAxisDomain={[1, 10]}
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {sleepData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sleep Quality</CardTitle>
              <CardDescription>
                How well you slept each night (1-10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ProgressCharts 
                  data={sleepData} 
                  dataKey="value" 
                  name="Sleep" 
                  color="#06b6d4" 
                  yAxisDomain={[1, 10]}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
