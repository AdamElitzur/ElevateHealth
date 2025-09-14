import { getSession } from '../actions/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import OnboardingForm from './onboarding-form'
import { getUserProfile } from '../actions/user-profile'

export default async function OnboardingPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/sign-in')
  }
  
  const userProfile = await getUserProfile()
  
  // If user already has a profile, redirect to dashboard
  if (userProfile && userProfile.gender && userProfile.age) {
    redirect('/dashboard')
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl space-y-8">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome to the No Sugar Challenge</CardTitle>
            <CardDescription>
              Let&apos;s set up your profile to get started with your 2-week journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
