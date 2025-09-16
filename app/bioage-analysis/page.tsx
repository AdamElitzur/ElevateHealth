'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface AnalysisResult {
  age?: number;
  confidence?: number;
  face_detected?: boolean;
  face_bbox?: number[];
  timestamp?: number;
}

export default function BioAgeAnalysisPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [clientId, setClientId] = useState('client-ssr');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [ageHistory, setAgeHistory] = useState<number[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [predictionInterval, setPredictionInterval] = useState(200); // 200ms like dashboard.js
  const [analysisInterval, setAnalysisInterval] = useState<NodeJS.Timeout | null>(null);

  // Generate clientId after hydration
  useEffect(() => {
    setClientId(`client-${Date.now()}`);
    console.log('Client hydrated, clientId generated');
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (ws) {
        ws.close();
      }
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
    };
  }, []); // Only run cleanup on unmount

  // Start continuous analysis when camera and WebSocket are ready
  const startContinuousAnalysis = () => {
    if (analysisInterval) {
      clearInterval(analysisInterval);
    }
    
    console.log('Starting continuous analysis...', { isConnected, hasStream: !!stream, predictionInterval });
    
    const interval = setInterval(() => {
      if (isConnected && stream && !isAnalyzing) {
        captureAndAnalyze();
      }
    }, predictionInterval);
    
    setAnalysisInterval(interval);
    console.log(`Started continuous analysis with ${predictionInterval}ms interval`);
  };

  const stopContinuousAnalysis = () => {
    if (analysisInterval) {
      clearInterval(analysisInterval);
      setAnalysisInterval(null);
    }
    console.log('Stopped continuous analysis');
  };

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      console.log('Camera stream obtained:', mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        toast.success('Camera started successfully');
        
        // Automatically connect to WebSocket when camera starts
        if (!isConnected) {
          setTimeout(() => {
            connectWebSocket();
          }, 500); // Short delay to ensure camera is ready
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error(`Camera error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Stop continuous analysis
    stopContinuousAnalysis();
    
    toast.info('Camera stopped');
  };

  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:8081/api/ws/${clientId}`;
    
    try {
      console.log('Connecting to WebSocket:', wsUrl);
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus('Connected');
        setWs(websocket);
        toast.success('Connected to analysis service');
        
        // Always start continuous analysis when WebSocket connects
        startContinuousAnalysis();
      };
      
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received analysis data:', data);
          
          // Handle error responses
          if (data.error) {
            console.error('Analysis error:', data.error);
            toast.error(`Analysis failed: ${data.error}`);
            setIsAnalyzing(false);
            // Don't update analysisResult with error data
            return;
          }
          
          // Update analysis result only if it's valid data
          if (data.age !== undefined || data.confidence !== undefined) {
            setAnalysisResult(data);
          } else {
            console.warn('Received data without age or confidence:', data);
          }
          
          // Add age to history if valid
          if (data.age !== undefined && data.age !== null && !isNaN(data.age)) {
            setAgeHistory(prev => [...prev.slice(-49), data.age]);
            console.log('Age added to history:', data.age);
          }
          
          // Always reset analyzing state
          setIsAnalyzing(false);
          console.log('Analysis completed, reset analyzing state');
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          toast.error('Error processing analysis result');
          setIsAnalyzing(false);
        }
      };
      
      websocket.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        setWs(null);
        stopContinuousAnalysis();
        toast.info('Disconnected from analysis service');
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('WebSocket connection error');
      };
      
    } catch (error) {
      toast.error(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const disconnectWebSocket = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    stopContinuousAnalysis();
  };

  const captureAndAnalyze = () => {
    if (!stream || !isConnected || isAnalyzing) {
      if (!stream) {
        console.log('No stream available');
      } else if (!isConnected) {
        console.log('Not connected to WebSocket');
      } else if (isAnalyzing) {
        console.log('Already analyzing, skipping...');
      }
      return;
    }
    
    try {
      setIsAnalyzing(true);
      console.log('Starting image capture and analysis...');
      
      if (videoRef.current && canvasRef.current && ws) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Ensure video is ready
          if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
            console.log('Video not ready, skipping this frame');
            setIsAnalyzing(false);
            return;
          }
          
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          const base64Image = canvas.toDataURL('image/jpeg', 0.8);
          
          // Check image size
          if (base64Image.length < 1000) {
            console.log('Image too small, skipping this frame');
            setIsAnalyzing(false);
            return;
          }
          
          console.log('Sending image for analysis...');
          ws.send(base64Image);
        }
      }
    } catch (error) {
      console.error('Capture error:', error);
      setIsAnalyzing(false);
    }
  };

  const calculateStats = () => {
    if (ageHistory.length === 0) return null;
    
    const sorted = [...ageHistory].sort((a, b) => a - b);
    const mean = ageHistory.reduce((sum, age) => sum + age, 0) / ageHistory.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...ageHistory);
    const max = Math.max(...ageHistory);
    const variance = ageHistory.reduce((sum, age) => sum + Math.pow(age - mean, 2), 0) / ageHistory.length;
    const stdDev = Math.sqrt(variance);
    
    return { mean, median, min, max, stdDev, samples: ageHistory.length };
  };

  const stats = calculateStats();

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
                <p className="text-xs text-blue-600 mt-1">
                  💡 Start Camera → Analysis begins automatically in live mode
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                connectionStatus === 'Connected' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {connectionStatus}
              </div>
              {analysisResult?.mock_data && (
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Demo Mode
                </div>
              )}
              {analysisInterval && (
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 animate-pulse">
                  Live Analysis
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Camera Feed</span>
                </CardTitle>
                <CardDescription>
                  Position your face clearly in the camera view for accurate analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  {analysisResult?.face_bbox && analysisResult.face_bbox.length >= 4 && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div
                        className="absolute border-2 border-yellow-400 rounded-lg animate-pulse"
                        style={{
                          left: `${analysisResult.face_bbox[0]}%`,
                          top: `${analysisResult.face_bbox[1]}%`,
                          width: `${analysisResult.face_bbox[2]}%`,
                          height: `${analysisResult.face_bbox[3]}%`,
                        }}
                      />
                    </div>
                  )}
                  {analysisResult?.age && (
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg">
                      Age: {analysisResult.age.toFixed(1)} years
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    onClick={startCamera}
                    disabled={!!stream}
                    variant="outline"
                    size="sm"
                  >
                    📷 Start Camera
                  </Button>
                  <Button
                    onClick={stopCamera}
                    disabled={!stream}
                    variant="outline"
                    size="sm"
                  >
                    ⏹️ Stop Camera
                  </Button>
                  <Button
                    onClick={disconnectWebSocket}
                    disabled={!isConnected}
                    variant="outline"
                    size="sm"
                  >
                    ❌ Disconnect
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('Manual WebSocket test:', { clientId, isConnected });
                      connectWebSocket();
                    }}
                    disabled={isConnected}
                    variant="outline"
                    size="sm"
                  >
                    🔧 Test WS
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('Testing mock data display');
                      const mockData = {
                        age: 25.5,
                        confidence: 0.85,
                        face_detected: true,
                        face_bbox: [100, 100, 200, 200],
                        timestamp: Date.now()
                      };
                      setAnalysisResult(mockData);
                      setAgeHistory(prev => [...prev.slice(-49), mockData.age]);
                      toast.success('Mock data applied for testing');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    🧪 Test Data
                  </Button>
                  <Button
                    onClick={() => {
                      if (stream && isConnected) {
                        startContinuousAnalysis();
                        toast.success('Analysis started manually');
                      } else {
                        toast.error('Please start camera and connect first');
                      }
                    }}
                    disabled={!stream || !isConnected}
                    variant="outline"
                    size="sm"
                  >
                    ▶️ Start Analysis
                  </Button>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${analysisInterval ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      <span>{analysisInterval ? 'Continuous Analysis Active' : 'Analysis Stopped'}</span>
                    </div>
                    {!stream && (
                      <div className="text-orange-600 text-xs">
                        ⚠️ Start camera to begin live analysis
                      </div>
                    )}
                    {stream && !isConnected && (
                      <div className="text-blue-600 text-xs">
                        🔗 Connecting to analysis service...
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <label className="text-xs">Interval:</label>
                      <select 
                        value={predictionInterval} 
                        onChange={(e) => {
                          setPredictionInterval(Number(e.target.value));
                          if (analysisInterval) {
                            startContinuousAnalysis();
                          }
                        }}
                        className="text-xs border rounded px-1 py-0.5"
                      >
                        <option value={100}>100ms</option>
                        <option value={200}>200ms</option>
                        <option value={500}>500ms</option>
                        <option value={1000}>1s</option>
                        <option value={2000}>2s</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Analysis Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Error Status Display */}
                {!isConnected && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600">⚠️</span>
                      <span className="text-red-800 font-medium">Connection Error</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      Unable to connect to analysis service. Please check your connection and try again.
                    </p>
                  </div>
                )}
                
                {isConnected && !analysisResult && (
                  <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-600">⏳</span>
                      <span className="text-yellow-800 font-medium">Waiting for Analysis</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      Start the camera to begin live analysis.
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult?.age ? `${analysisResult.age.toFixed(1)}` : '--'}
                    </div>
                    <div className="text-sm text-gray-600">Biological Age</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResult?.confidence ? `${(analysisResult.confidence * 100).toFixed(1)}%` : '--'}
                    </div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult?.face_detected || (analysisResult?.face_bbox && analysisResult.face_bbox.length >= 4) ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-gray-600">Face Detected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {ageHistory.length}
                    </div>
                    <div className="text-sm text-gray-600">Samples</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">
                      {analysisInterval ? 'LIVE' : 'OFF'}
                    </div>
                    <div className="text-sm text-gray-600">Analysis Mode</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Section */}
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Statistical Analysis</span>
                </CardTitle>
                <CardDescription>
                  Real-time statistics from your analysis sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{stats.mean.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Mean Age</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{stats.median.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Median Age</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600">{stats.min.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Min Age</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-600">{stats.max.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Max Age</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{stats.stdDev.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Std Deviation</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-indigo-600">{stats.samples}</div>
                      <div className="text-sm text-gray-600">Total Samples</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {analysisResult?.mock_data ? (
                      <div className="space-y-2">
                        <p>Demo mode active - showing mock data</p>
                        <p className="text-sm">External service is currently unavailable</p>
                      </div>
                    ) : (
                      "No analysis data yet. Start analyzing to see statistics."
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-white/20">
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
                <CardDescription>
                  Follow these steps for accurate biological age analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Start Camera</h4>
                      <p className="text-sm text-gray-600">Click "Start Camera" and allow camera access</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Connect Service</h4>
                      <p className="text-sm text-gray-600">Click "Connect Service" to establish analysis connection</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Analyze Photo</h4>
                      <p className="text-sm text-gray-600">Position your face clearly and click "Analyze Photo"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
