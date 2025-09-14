'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadImageToSupabase } from '@/lib/client-upload'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  defaultImage?: string
  className?: string
}

export default function ImageUpload({ onImageUploaded, defaultImage, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(defaultImage || null)
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Create a preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    
    setIsUploading(true)
    setError(null)
    
    try {
      const result = await uploadImageToSupabase(file)
      
      if ('error' in result) {
        setError(result.error)
        return
      }
      
      onImageUploaded(result.url)
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <div className={className}>
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-32 w-32">
          {preview ? (
            <AvatarImage src={preview} alt="Preview" />
          ) : (
            <AvatarFallback>Upload</AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex items-center justify-center">
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="max-w-xs"
            disabled={isUploading}
          />
        </div>
        
        {isUploading && (
          <div className="text-sm text-muted-foreground">
            Uploading...
          </div>
        )}
        
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
