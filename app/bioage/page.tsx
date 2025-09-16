'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BioAgePage() {
  const router = useRouter();

  const handleStartAnalysis = () => {
    // Navigate to the new BioAge analysis page
    router.push('/bioage-analysis');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Back to Dashboard
                </Button>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">BA</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">BioAge Analysis</h1>
                  <p className="text-sm text-gray-600">Real-time biological age estimation</p>
                </div>
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
                Track Your Biological Age Progress
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Monitor how your no sugar challenge is affecting your biological age with our advanced AI-powered analysis.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Real-time Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Get instant biological age estimates using computer vision
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Live camera feed analysis</li>
                    <li>• Instant age predictions</li>
                    <li>• Face detection technology</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Progress Tracking</span>
                  </CardTitle>
                  <CardDescription>
                    Monitor your biological age changes over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Daily measurements</li>
                    <li>• Trend visualization</li>
                    <li>• Statistical analysis</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Health Insights</span>
                  </CardTitle>
                  <CardDescription>
                    Understand how lifestyle changes affect your aging
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Age distribution charts</li>
                    <li>• Health recommendations</li>
                    <li>• Challenge correlation</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    Ready to See Your Progress?
                  </h3>
                  <p className="text-lg opacity-90 mb-6">
                    Start analyzing your biological age and track how your no sugar challenge is improving your health.
                  </p>
                  <Button
                    onClick={handleStartAnalysis}
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 font-medium px-8 py-3"
                  >
                    Start BioAge Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>How to Use BioAge Analysis</CardTitle>
                <CardDescription>
                  Follow these steps to get the most accurate results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold text-lg">1</span>
                    </div>
                    <h4 className="font-semibold mb-2">Allow Camera Access</h4>
                    <p className="text-sm text-gray-600">
                      Grant permission for camera access to enable real-time analysis
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 font-bold text-lg">2</span>
                    </div>
                    <h4 className="font-semibold mb-2">Position Your Face</h4>
                    <p className="text-sm text-gray-600">
                      Ensure good lighting and position your face clearly in the camera view
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-600 font-bold text-lg">3</span>
                    </div>
                    <h4 className="font-semibold mb-2">Track Progress</h4>
                    <p className="text-sm text-gray-600">
                      Monitor your biological age changes as you progress through the challenge
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
    </div>
  );
}
