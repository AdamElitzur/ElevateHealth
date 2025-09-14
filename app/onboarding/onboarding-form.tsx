'use client'

import { useState } from 'react'
import { createUserProfile, uploadProfilePhoto } from '../actions/user-profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'

export default function OnboardingForm() {
  const router = useRouter()
  const [gender, setGender] = useState<string>('')
  const [age, setAge] = useState<string>('')
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    if (!gender || !age) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setIsUploading(true)
      
      // Upload photo if selected
      let finalPhotoUrl = photoUrl
      if (photoFile) {
        const result = await uploadProfilePhoto(photoFile)
        if (result.error) {
          setError(result.error.message)
          setIsUploading(false)
          return
        }
        finalPhotoUrl = result.url
      }
      
      // Create form data
      const formData = new FormData()
      formData.append('gender', gender)
      formData.append('age', age)
      if (finalPhotoUrl) {
        formData.append('photo_url', finalPhotoUrl)
      }
      
      // Submit profile data
      const response = await createUserProfile(formData)
      
      if (response?.error) {
        setError(typeof response.error === 'string' 
          ? response.error 
          : Object.values(response.error).flat().join(', '))
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <Label htmlFor="photo" className="text-center">Profile Photo</Label>
          <Avatar className="h-32 w-32">
            {photoPreview ? (
              <AvatarImage src={photoPreview} alt="Profile preview" />
            ) : (
              <AvatarFallback>Upload</AvatarFallback>
            )}
          </Avatar>
          <div className="flex items-center justify-center">
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="max-w-xs"
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            This photo will be used to calculate your biological age
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={setGender} required>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min="18"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Your age"
            required
          />
        </div>
      </div>
      
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={isUploading}>
        {isUploading ? 'Saving...' : 'Start My Challenge'}
      </Button>
    </form>
  )
}
