'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase-client'

export async function uploadImageToSupabase(file: File): Promise<{ url: string } | { error: string }> {
  try {
    if (!file) {
      return { error: 'No file selected' }
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File size exceeds 5MB limit' }
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { error: 'Only image files are allowed' }
    }
    
    const supabase = createSupabaseBrowserClient()
    
    // Get user ID for the filename
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'User not authenticated' }
    }
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    
    // Upload to Supabase storage
    const { error: uploadError, data } = await supabase
      .storage
      .from('photos')
      .upload(fileName, file)
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: uploadError.message }
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('photos')
      .getPublicUrl(fileName)
    
    return { url: publicUrl }
  } catch (error) {
    console.error('Unexpected error during upload:', error)
    return { error: 'An unexpected error occurred during upload' }
  }
}
