'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();

  // Mock user data for demo purposes
  const user = {
    id: '1',
    name: 'Challenge Participant',
    email: 'participant@example.com',
    challengeStartDate: new Date().toISOString(),
    currentDay: 1,
  };

  const challengeStartDate = user.challengeStartDate ? new Date(user.challengeStartDate) : new Date();
  const daysSinceStart = Math.floor((new Date().getTime() - challengeStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(daysSinceStart + 1, 14);
  const progressPercentage = (currentDay / 14) * 100;

  const handleLogout = () => {
    toast.success('Thanks for using ElevateHealth!');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">NS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">No Sugar Challenge</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Continue Your No Sugar Challenge Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You're doing great! Keep tracking your progress and stay committed to your sugar-free lifestyle.
            </p>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Current Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{currentDay}</div>
                <p className="text-xs text-gray-500">of 14 days</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{Math.round(progressPercentage)}%</div>
                <Progress value={progressPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Days Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{14 - currentDay}</div>
                <p className="text-xs text-gray-500">days to go</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{currentDay}</div>
                <p className="text-xs text-gray-500">days strong</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Log Today's Progress</span>
                </CardTitle>
                <CardDescription>
                  Track your daily metrics and mood
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Log Progress
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Food Analytics</span>
                </CardTitle>
                <CardDescription>
                  Analyze food images for nutrition and health insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => router.push('/food-analytics')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>BioAge Analysis</span>
                </CardTitle>
                <CardDescription>
                  Check your biological age progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  onClick={() => router.push('/bioage-analysis')}
                >
                  Analyze BioAge
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Quote */}
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="text-center">
                <blockquote className="text-lg italic mb-4">
                  "The secret of getting ahead is getting started."
                </blockquote>
                <p className="text-sm opacity-90">- Mark Twain</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
