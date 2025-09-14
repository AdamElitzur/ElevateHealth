'use client'

import { useState } from 'react'
import { createDailyLog } from '@/app/actions/daily-log'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { DailyLog } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DailyLogFormProps {
  existingLog: DailyLog | null
}

export default function DailyLogForm({ existingLog }: DailyLogFormProps) {
  const router = useRouter()
  const today = format(new Date(), 'yyyy-MM-dd')
  
  const [sugarIntake, setSugarIntake] = useState(
    existingLog?.sugar_intake_grams?.toString() || ''
  )
  const [weight, setWeight] = useState(
    existingLog?.weight_kg?.toString() || ''
  )
  const [moodRating, setMoodRating] = useState(
    existingLog?.mood_rating?.toString() || ''
  )
  const [cravingsRating, setCravingsRating] = useState(
    existingLog?.cravings_rating?.toString() || ''
  )
  const [energyRating, setEnergyRating] = useState(
    existingLog?.energy_rating?.toString() || ''
  )
  const [sleepRating, setSleepRating] = useState(
    existingLog?.sleep_rating?.toString() || ''
  )
  const [notes, setNotes] = useState(existingLog?.notes || '')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!sugarIntake) {
      setError('Sugar intake is required')
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append('date', today)
      formData.append('sugar_intake_grams', sugarIntake)
      
      if (weight) formData.append('weight_kg', weight)
      if (moodRating) formData.append('mood_rating', moodRating)
      if (cravingsRating) formData.append('cravings_rating', cravingsRating)
      if (energyRating) formData.append('energy_rating', energyRating)
      if (sleepRating) formData.append('sleep_rating', sleepRating)
      if (notes) formData.append('notes', notes)
      
      const response = await createDailyLog(formData)
      
      if (response?.error) {
        setError(typeof response.error === 'string' 
          ? response.error 
          : Object.values(response.error).flat().join(', '))
      } else {
        setSuccess('Log saved successfully!')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="feelings">How You Feel</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="sugar_intake">
              Sugar Intake (grams) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sugar_intake"
              type="number"
              min="0"
              step="0.1"
              value={sugarIntake}
              onChange={(e) => setSugarIntake(e.target.value)}
              placeholder="0"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the total amount of sugar you consumed today
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="20"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="feelings" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mood">Mood (1-10)</Label>
              <Input
                id="mood"
                type="number"
                min="1"
                max="10"
                value={moodRating}
                onChange={(e) => setMoodRating(e.target.value)}
                placeholder="1-10"
              />
              <p className="text-xs text-muted-foreground">
                1 = Very bad, 10 = Excellent
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cravings">Sugar Cravings (1-10)</Label>
              <Input
                id="cravings"
                type="number"
                min="1"
                max="10"
                value={cravingsRating}
                onChange={(e) => setCravingsRating(e.target.value)}
                placeholder="1-10"
              />
              <p className="text-xs text-muted-foreground">
                1 = No cravings, 10 = Extreme cravings
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="energy">Energy Level (1-10)</Label>
              <Input
                id="energy"
                type="number"
                min="1"
                max="10"
                value={energyRating}
                onChange={(e) => setEnergyRating(e.target.value)}
                placeholder="1-10"
              />
              <p className="text-xs text-muted-foreground">
                1 = Exhausted, 10 = Very energetic
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sleep">Sleep Quality (1-10)</Label>
              <Input
                id="sleep"
                type="number"
                min="1"
                max="10"
                value={sleepRating}
                onChange={(e) => setSleepRating(e.target.value)}
                placeholder="1-10"
              />
              <p className="text-xs text-muted-foreground">
                1 = Very poor, 10 = Excellent
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about your day..."
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">
          {success}
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : existingLog ? 'Update Log' : 'Save Log'}
      </Button>
    </form>
  )
}
