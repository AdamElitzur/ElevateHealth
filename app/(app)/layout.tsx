import { getSession } from '../actions/auth'
import { redirect } from 'next/navigation'
import { getUserProfile } from '../actions/user-profile'
import AppHeader from '@/app/components/app-header'
import AppSidebar from '@/app/components/app-sidebar'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()
  
  if (!session) {
    redirect('/sign-in')
  }
  
  const userProfile = await getUserProfile()
  
  // If user hasn't completed onboarding, redirect to onboarding
  if (!userProfile || !userProfile.gender || !userProfile.age) {
    redirect('/onboarding')
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader user={session.user} />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
