'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { UserProfile } from '@/lib/types'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const userProfileSchema = z.object({
  gender: z.enum(['male', 'female', 'other']),
  age: z.coerce.number().min(18, 'You must be at least 18 years old'),
  photo_url: z.string().optional(),
})

export async function createUserProfile(formData: FormData) {
  const supabase = createSupabaseServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return {
      error: {
        message: 'You must be logged in to create a profile',
      },
    }
  }
  
  const gender = formData.get('gender') as string
  const age = Number(formData.get('age'))
  const photo_url = formData.get('photo_url') as string || null
  
  const validatedFields = userProfileSchema.safeParse({
    gender,
    age,
    photo_url,
  })
  
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }
  
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
  
  if (existingProfile) {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        gender,
        age,
        photo_url,
      })
      .eq('id', session.user.id)
    
    if (error) {
      return {
        error: {
          message: error.message,
        },
      }
    }
  } else {
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: session.user.id,
        email: session.user.email!,
        gender,
        age,
        photo_url,
        challenge_start_date: new Date().toISOString(),
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
  redirect('/dashboard')
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createSupabaseServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }
  
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
  
  return data
}

export async function uploadProfilePhoto(file: File) {
  const supabase = createSupabaseServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return {
      error: {
        message: 'You must be logged in to upload a photo',
      },
    }
  }
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${session.user.id}-${Date.now()}.${fileExt}`
  
  const { error: uploadError, data } = await supabase
    .storage
    .from('profile-photos')
    .upload(fileName, file)
  
  if (uploadError) {
    return {
      error: {
        message: uploadError.message,
      },
    }
  }
  
  const { data: { publicUrl } } = supabase
    .storage
    .from('profile-photos')
    .getPublicUrl(fileName)
  
  return {
    success: true,
    url: publicUrl,
  }
}
