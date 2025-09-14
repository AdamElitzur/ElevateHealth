'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { DailyLog } from '@/lib/types'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const dailyLogSchema = z.object({
  date: z.string(),
  sugar_intake_grams: z.coerce.number().min(0, 'Sugar intake cannot be negative'),
  weight_kg: z.coerce.number().min(20, 'Weight must be at least 20kg').optional(),
  mood_rating: z.coerce.number().min(1, 'Rating must be between 1-10').max(10, 'Rating must be between 1-10').optional(),
  cravings_rating: z.coerce.number().min(1, 'Rating must be between 1-10').max(10, 'Rating must be between 1-10').optional(),
  energy_rating: z.coerce.number().min(1, 'Rating must be between 1-10').max(10, 'Rating must be between 1-10').optional(),
  sleep_rating: z.coerce.number().min(1, 'Rating must be between 1-10').max(10, 'Rating must be between 1-10').optional(),
  notes: z.string().optional(),
})

export async function createDailyLog(formData: FormData) {
  const supabase = createSupabaseServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return {
      error: {
        message: 'You must be logged in to create a log',
      },
    }
  }
  
  const date = formData.get('date') as string
  const sugar_intake_grams = Number(formData.get('sugar_intake_grams'))
  const weight_kg = formData.get('weight_kg') ? Number(formData.get('weight_kg')) : null
  const mood_rating = formData.get('mood_rating') ? Number(formData.get('mood_rating')) : null
  const cravings_rating = formData.get('cravings_rating') ? Number(formData.get('cravings_rating')) : null
  const energy_rating = formData.get('energy_rating') ? Number(formData.get('energy_rating')) : null
  const sleep_rating = formData.get('sleep_rating') ? Number(formData.get('sleep_rating')) : null
  const notes = formData.get('notes') as string || null
  
  const validatedFields = dailyLogSchema.safeParse({
    date,
    sugar_intake_grams,
    weight_kg,
    mood_rating,
    cravings_rating,
    energy_rating,
    sleep_rating,
    notes,
  })
  
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }
  
  // Check if a log already exists for this date
  const { data: existingLog } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('date', date)
    .single()
  
  if (existingLog) {
    // Update existing log
    const { error } = await supabase
      .from('daily_logs')
      .update({
        sugar_intake_grams,
        weight_kg,
        mood_rating,
        cravings_rating,
        energy_rating,
        sleep_rating,
        notes,
      })
      .eq('id', existingLog.id)
    
    if (error) {
      return {
        error: {
          message: error.message,
        },
      }
    }
  } else {
    // Create new log
    const { error } = await supabase
      .from('daily_logs')
      .insert({
        user_id: session.user.id,
        date,
        sugar_intake_grams,
        weight_kg,
        mood_rating,
        cravings_rating,
        energy_rating,
        sleep_rating,
        notes,
      })
    
    if (error) {
      return {
        error: {
          message: error.message,
        },
      }
    }
  }
  
  revalidatePath('/dashboard')
  
  return {
    success: true,
    message: 'Log saved successfully',
  }
}

export async function getDailyLog(date: string): Promise<DailyLog | null> {
  const supabase = createSupabaseServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }
  
  const { data } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('date', date)
    .single()
  
  return data
}

export async function getDailyLogs(startDate?: string, endDate?: string): Promise<DailyLog[]> {
  const supabase = createSupabaseServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return []
  }
  
  let query = supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })
  
  if (startDate) {
    query = query.gte('date', startDate)
  }
  
  if (endDate) {
    query = query.lte('date', endDate)
  }
  
  const { data } = await query
  
  return data || []
}
