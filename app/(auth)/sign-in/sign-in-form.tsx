'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

// Define the possible return types from the signIn function
type SignInResult = {
  success?: boolean;
  user?: any;
  error?: {
    message: string;
  } | Record<string, string[]> | string;
}

export default function SignInForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    setIsLoading(true)
    setErrorMessage(null)
    
    try {
      // Call the server action and cast the result
      const result = await signIn(formData) as SignInResult
      
      // If there's no error, redirect to dashboard
      if (!result || !result.error) {
        router.push('/dashboard')
        router.refresh()
        return
      }
      
      // Handle different error formats
      if (typeof result.error === 'string') {
        setErrorMessage(result.error)
      } else if (result.error && typeof result.error === 'object' && 'message' in result.error) {
        setErrorMessage(result.error.message)
      } else if (result.error && typeof result.error === 'object') {
        // Handle validation errors (which come as Record<string, string[]>)
        const errorMessages: string[] = []
        
        Object.entries(result.error).forEach(([field, errors]) => {
          if (Array.isArray(errors)) {
            errors.forEach(error => errorMessages.push(error))
          }
        })
        
        setErrorMessage(errorMessages.length > 0 
          ? errorMessages.join(', ') 
          : 'Invalid email or password')
      } else {
        setErrorMessage('Invalid email or password')
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your.email@example.com"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
      </div>
      
      {errorMessage && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {errorMessage}
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
