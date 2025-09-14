'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DailyLog } from '@/lib/types'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const ratingSchema = z.union([
  z.coerce
    .number()
    .min(1, 'Rating must be between 1-10')
    .max(10, 'Rating must be between 1-10'),
  z.literal('').transform(() => undefined),
  z.undefined(),
  z.null()
]);

const dailyLogSchema = z.object({
  date: z.string(),
  sugar_intake_grams: z.union([
    z.coerce.number().min(0, 'Sugar intake cannot be negative'),
    z.literal('').transform(() => undefined),
    z.undefined(),
    z.null()
  ]).optional(),
  weight_kg: z.union([
    z.coerce.number().min(20, 'Weight must be at least 20kg'),
    z.literal('').transform(() => undefined),
    z.undefined(),
    z.null()
  ]).optional(),
  mood_rating: ratingSchema.optional(),
  cravings_rating: ratingSchema.optional(),
  energy_rating: ratingSchema.optional(),
  sleep_rating: ratingSchema.optional(),
  notes: z.union([z.string(), z.literal(''), z.undefined(), z.null()]).optional(),
  product_name: z.union([z.string(), z.literal(''), z.undefined(), z.null()]).optional(),
  product_barcode: z.union([z.string(), z.literal(''), z.undefined(), z.null()]).optional(),
  meal_category: z.union([z.string(), z.literal(''), z.undefined(), z.null()]).optional(),
  meal_time: z.union([z.string(), z.literal(''), z.undefined(), z.null()]).optional(),
}).transform((data) => ({
  ...data,
  // Transform empty strings to undefined for all fields
  ...Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === '' ? undefined : value])
  )
}));

export async function createDailyLog(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return {
      error: {
        message: 'You must be logged in to create a log',
      },
    }
  }
  
  // Helper function to safely parse form data
  const getFormValue = (key: string) => {
    const value = formData.get(key);
    return value === '' ? null : value;
  };

  const date = getFormValue('date') as string;
  const sugar_intake_grams = getFormValue('sugar_intake_grams') ? Number(getFormValue('sugar_intake_grams')) : null;
  const weight_kg = getFormValue('weight_kg') ? Number(getFormValue('weight_kg')) : null;
  const mood_rating = getFormValue('mood_rating') ? Number(getFormValue('mood_rating')) : null;
  const cravings_rating = getFormValue('cravings_rating') ? Number(getFormValue('cravings_rating')) : null;
  const energy_rating = getFormValue('energy_rating') ? Number(getFormValue('energy_rating')) : null;
  const sleep_rating = getFormValue('sleep_rating') ? Number(getFormValue('sleep_rating')) : null;
  const notes = getFormValue('notes') as string | null;
  const product_name = getFormValue('product_name') as string | null;
  const product_barcode = getFormValue('product_barcode') as string | null;
  const meal_category = getFormValue('meal_category') as string | null;
  const meal_time = getFormValue('meal_time') as string | null;
  
  const validatedFields = dailyLogSchema.safeParse({
    date,
    sugar_intake_grams,
    weight_kg,
    mood_rating,
    cravings_rating,
    energy_rating,
    sleep_rating,
    notes,
    product_name,
    product_barcode,
    meal_category,
    meal_time
  })
  
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }
  
  // Always create a new log entry
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
      product_name,
      product_barcode,
      meal_category,
      meal_time,
    })
  
  if (error) {
    return {
      error: {
        message: error.message,
      },
    }
  }
  
  revalidatePath('/dashboard')
  
  return {
    success: true,
    message: 'Log saved successfully',
  }
}

export async function getDailyLog(date: string): Promise<DailyLog | null> {
  const supabase = await createSupabaseServerClient()
  
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
  const supabase = await createSupabaseServerClient()
  
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
