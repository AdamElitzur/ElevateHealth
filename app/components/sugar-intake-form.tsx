'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { createDailyLog } from '@/app/actions/daily-log'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface ProductInfo {
  name?: string;
  sugarContent?: number;
  barcode?: string;
}

export default function SugarIntakeForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [sugarIntake, setSugarIntake] = useState('')
  const [weight, setWeight] = useState('')
  const [moodRating, setMoodRating] = useState<number>(5)
  const [energyRating, setEnergyRating] = useState<number>(5)
  const [cravingsRating, setCravingsRating] = useState<number>(5)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null)

  const handleBarcodeDetected = async (barcode: string) => {
    // In a real app, you would fetch product info from a food database API
    // For now, we'll simulate this with a mock response
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock product info - in production, this would come from an API
      const mockProductInfo = {
        name: `Product (${barcode})`,
        sugarContent: Math.floor(Math.random() * 30),
        barcode
      }
      
      setProductInfo(mockProductInfo)
      setSugarIntake(mockProductInfo.sugarContent.toString())
      
      toast({
        title: "Product Found",
        description: `${mockProductInfo.name} - ${mockProductInfo.sugarContent}g sugar`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not find product information",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('date', date)
      formData.append('sugar_intake_grams', sugarIntake)
      
      if (weight) formData.append('weight_kg', weight)
      if (moodRating) formData.append('mood_rating', moodRating.toString())
      if (energyRating) formData.append('energy_rating', energyRating.toString())
      if (cravingsRating) formData.append('cravings_rating', cravingsRating.toString())
      if (notes) formData.append('notes', notes)
      
      // Add product info if available
      if (productInfo) {
        formData.append('product_name', productInfo.name || '')
        formData.append('product_barcode', productInfo.barcode || '')
      }

      const result = await createDailyLog(formData)
      
      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : 'Failed to save log';
        throw new Error(errorMessage);
      }
      
      toast({
        title: "Success",
        description: "Your daily log has been saved",
      })
      
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save log",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Log Your Daily Sugar Intake</CardTitle>
        <CardDescription>
          Track your sugar consumption and how you feel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sugar-intake">Sugar Intake (grams)</Label>
            <Input
              id="sugar-intake"
              type="number"
              min="0"
              placeholder="Enter sugar intake in grams"
              value={sugarIntake}
              onChange={(e) => setSugarIntake(e.target.value)}
              required
            />
            {productInfo && (
              <p className="text-sm text-muted-foreground">
                From product: {productInfo.name}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg) - Optional</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              step="0.1"
              placeholder="Enter your weight in kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mood">Mood Rating (1-10)</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm">1</span>
              <Slider
                id="mood"
                min={1}
                max={10}
                step={1}
                value={[moodRating]}
                onValueChange={(value) => setMoodRating(value[0])}
                className="flex-1"
              />
              <span className="text-sm">10</span>
            </div>
            <p className="text-xs text-muted-foreground text-right">{moodRating}/10</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="energy">Energy Level (1-10)</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm">1</span>
              <Slider
                id="energy"
                min={1}
                max={10}
                step={1}
                value={[energyRating]}
                onValueChange={(value) => setEnergyRating(value[0])}
                className="flex-1"
              />
              <span className="text-sm">10</span>
            </div>
            <p className="text-xs text-muted-foreground text-right">{energyRating}/10</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cravings">Sugar Cravings (1-10)</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm">1</span>
              <Slider
                id="cravings"
                min={1}
                max={10}
                step={1}
                value={[cravingsRating]}
                onValueChange={(value) => setCravingsRating(value[0])}
                className="flex-1"
              />
              <span className="text-sm">10</span>
            </div>
            <p className="text-xs text-muted-foreground text-right">{cravingsRating}/10</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about your day"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Log"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
