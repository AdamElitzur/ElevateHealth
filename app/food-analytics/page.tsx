'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, MapPin, Utensils, Heart, AlertTriangle, CheckCircle, XCircle, Zap, TrendingUp, Scan } from 'lucide-react';
import { toast } from 'sonner';

interface FoodAnalysis {
  foodItems: Array<{
    name: string;
    confidence: number;
    ingredients: string[];
    calories: number;
    healthScore: number;
    allergens: string[];
    nutritionalInfo: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugar: number;
      sodium: number;
    };
  }>;
  location?: {
    address: string;
    restaurant?: string;
    menuItems?: Array<{
      name: string;
      price: string;
      description: string;
    }>;
  };
  overallHealthScore: number;
  recommendations: string[];
  timestamp: number;
}

export default function FoodAnalyticsPage() {
  const [image, setImage] = useState<string | null>(null);
  
  // Debug image state changes
  useEffect(() => {
    console.log('Image state changed:', {
      hasImage: !!image,
      imageType: typeof image,
      imageLength: image?.length,
      imageStart: image?.substring(0, 30)
    });
  }, [image]);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'file' | 'barcode'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [barcodeData, setBarcodeData] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [barcodeReader, setBarcodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure video element is ready
  useEffect(() => {
    const checkVideoElement = () => {
      if (videoRef.current) {
        console.log('Video element is ready');
      } else {
        console.log('Video element not ready yet, retrying...');
        setTimeout(checkVideoElement, 100);
      }
    };
    checkVideoElement();
  }, []);

  const startCamera = async () => {
    setIsStartingCamera(true);
    setCameraError(null);
    
    try {
      console.log('Requesting camera access...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Check if we're on HTTPS or localhost
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        throw new Error('Camera requires HTTPS or localhost');
      }

      // Wait for video element to be ready with retries
      let retries = 0;
      while (!videoRef.current && retries < 10) {
        console.log(`Waiting for video element... attempt ${retries + 1}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (!videoRef.current) {
        throw new Error('Video element not available - please refresh the page and try again');
      }

      console.log('Video element is ready, requesting camera...');

      let mediaStream;
      try {
        // Try to get back camera first
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'environment' } // Use back camera for food photos
          },
          audio: false
        });
      } catch (envError) {
        console.log('Back camera not available, trying front camera...', envError);
        // Fallback to any available camera
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
      }
      
      console.log('Camera stream obtained:', mediaStream);
      
      // Set the video source
      console.log('Setting video source...');
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      
      // Wait for video to load
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        videoRef.current?.play().catch(console.error);
        setIsStartingCamera(false);
      };
      
      // Also try to play immediately
      try {
        await videoRef.current.play();
        console.log('Video playing successfully');
        setIsStartingCamera(false);
      } catch (playError) {
        console.log('Video play failed, waiting for metadata:', playError);
        // Don't set isStartingCamera to false here, let onloadedmetadata handle it
      }
      
      toast.success('Camera started successfully');
    } catch (error) {
      console.error('Error starting camera:', error);
      setIsStartingCamera(false);
      
      let errorMessage = 'Failed to start camera';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported on this device.';
        } else {
          errorMessage = `Camera error: ${error.message}`;
        }
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Get video dimensions
        const video = videoRef.current;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        console.log('Video dimensions:', videoWidth, 'x', videoHeight);
        
        if (videoWidth === 0 || videoHeight === 0) {
          toast.error('Video not ready. Please wait a moment and try again.');
          return;
        }
        
        // Set canvas dimensions
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        
        // Draw the video frame to canvas (mirrored back to normal)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -videoWidth, 0, videoWidth, videoHeight);
        ctx.restore();
        
        // Convert to image
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Image captured, size:', imageData.length, 'bytes');
        console.log('Image data type:', typeof imageData);
        console.log('Image data starts with:', imageData.substring(0, 30));
        
        console.log('Setting image state with:', typeof imageData, imageData.substring(0, 30));
        setImage(imageData);
        stopCamera();
        toast.success('Photo captured successfully! Starting analysis...');
        
        // Automatically start analysis after capturing photo
        setTimeout(() => {
          console.log('About to call analyzeFood with:', typeof imageData, imageData.substring(0, 30));
          analyzeFood(imageData);
        }, 100); // Small delay to ensure state is updated
      } else {
        toast.error('Failed to capture photo - canvas context not available');
      }
    } else {
      toast.error('Camera not ready. Please start the camera first.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('File reader result type:', typeof result);
        console.log('File reader result starts with:', result?.substring(0, 30));
        console.log('Setting image state with file result:', typeof result, result?.substring(0, 30));
        setImage(result);
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBarcodeSubmit = async () => {
    if (!barcodeData.trim()) {
      toast.error('Please enter a barcode number');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Call API to analyze barcode
      const response = await fetch('/api/analyze-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcode: barcodeData.trim()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to analyze barcode: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      setAnalysis(result);
      toast.success('Barcode analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing barcode:', error);
      toast.error('Failed to analyze barcode. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startBarcodeScanning = async () => {
    if (!stream || !videoRef.current) {
      toast.error('Camera not ready. Please start the camera first.');
      return;
    }

    setIsScanningBarcode(true);
    try {
      const reader = new BrowserMultiFormatReader();
      setBarcodeReader(reader);

      // Start scanning for barcodes
      const result = await reader.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
        if (result) {
          console.log('Barcode detected:', result.getText());
          setBarcodeData(result.getText());
          setIsScanningBarcode(false);
          reader.reset();
          setBarcodeReader(null);
          toast.success('Barcode detected! Analyzing...');
          
          // Automatically analyze the detected barcode
          setTimeout(() => {
            handleBarcodeSubmit();
          }, 500);
        }
        if (error && !(error instanceof Error && error.name === 'NotFoundException')) {
          console.error('Barcode scanning error:', error);
        }
      });

    } catch (error) {
      console.error('Error starting barcode scanning:', error);
      toast.error('Failed to start barcode scanning');
      setIsScanningBarcode(false);
    }
  };

  const stopBarcodeScanning = () => {
    if (barcodeReader) {
      (barcodeReader as any).reset();
      setBarcodeReader(null);
    }
    setIsScanningBarcode(false);
  };

  const analyzeFood = async (imageToAnalyze?: string) => {
    console.log('analyzeFood called with:', typeof imageToAnalyze, imageToAnalyze);
    console.log('Current image state:', typeof image, image?.substring(0, 50));
    
    // Use the passed parameter or fall back to the image state
    let imageData = imageToAnalyze || image;
    
    // If imageData is still invalid, try to get it from the image state again
    if (!imageData || (typeof imageData === 'object' && String(imageData) === '[object Object]')) {
      console.log('Image data is invalid, using image state directly');
      imageData = image;
      if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
        console.error('No valid image data found in state:', typeof image, image);
        toast.error('No valid image data found. Please capture or upload an image first.');
        return;
      }
    }
    
    if (!imageData) {
      toast.error('Please capture or upload an image first');
      return;
    }

    // Ensure imageData is a string
    console.log('Image data type:', typeof imageData);
    console.log('Image data constructor:', imageData?.constructor?.name);
    console.log('Image data value:', imageData);
    console.log('Image data length:', imageData?.length);
    
    // Ensure we have a valid string
    let imageString: string;
    
    if (typeof imageData === 'string') {
      // Check if it already has the data:image/ prefix
      if (imageData.startsWith('data:image/')) {
        imageString = imageData;
        console.log('Image string is valid with data prefix:', imageString.substring(0, 30));
      } else if (imageData.length > 100 && /^[A-Za-z0-9+/=]+$/.test(imageData)) {
        // It's a base64 string without the data URL prefix, add it
        imageString = `data:image/jpeg;base64,${imageData}`;
        console.log('Added data prefix to base64 string:', imageString.substring(0, 30));
        // Update the image state with the corrected format
        setImage(imageString);
      } else {
        console.error('Image data is not a valid format:', typeof imageData, imageData?.substring?.(0, 50));
        toast.error('Invalid image data format. Please try capturing or uploading again.');
        return;
      }
    } else {
      console.error('Image data is not a string:', typeof imageData, imageData);
      toast.error('Invalid image data format. Please try capturing or uploading again.');
      return;
    }
    
    // Final validation
    if (!imageString || imageString === 'undefined' || imageString === 'null') {
      console.error('Image data is empty or invalid:', imageString);
      toast.error('No valid image data found. Please try uploading again.');
      return;
    }

    console.log('Starting food analysis...');
    console.log('Image data length:', imageString.length);
    console.log('Image preview:', imageString.substring(0, 100) + '...');
    
    setIsAnalyzing(true);
    try {
      // Get user location if available
      let location = null;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
        });
        
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      } catch (geoError) {
        console.log('Location not available:', geoError);
      }

      // Call the API to analyze the food
      console.log('Calling API with image and location:', { 
        imageLength: imageString.length, 
        imageStart: imageString.substring(0, 50),
        imageFormat: imageString.startsWith('data:image/') ? 'Valid' : 'Invalid',
        location, 
        restaurantUrl: 'https://asarobakerycafe.toast.site/menu/asaro-cafe-bakery-1629-cambridge-street' 
      });
      
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageString,
          location,
          restaurantUrl: 'https://asarobakerycafe.toast.site/menu/asaro-cafe-bakery-1629-cambridge-street'
        }),
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to analyze food: ${response.status} ${errorText}`);
      }

      const analysisData = await response.json();
      console.log('Analysis data received:', analysisData);
      setAnalysis(analysisData);
      toast.success('Food analysis completed!');
    } catch (error) {
      console.error('Error analyzing food:', error);
      toast.error('Failed to analyze food image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-3">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Food Analytics
          </h1>
          <p className="text-base text-gray-600 max-w-lg mx-auto">
            Upload a food image to get detailed nutritional analysis and health insights powered by AI
          </p>
        </div>

        {/* Image Capture/Upload Section */}
        <Card className="bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Food Image Analysis</h2>
                  <p className="text-sm text-gray-600">Capture a photo or upload an image for analysis</p>
                </div>
              </div>
              <Button
                onClick={() => setShowDebug(!showDebug)}
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg px-2 py-1"
              >
                {showDebug ? 'Hide' : 'Show'} Debug
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Method Tabs */}
            <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'camera' | 'file' | 'barcode')}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="camera" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 font-medium text-sm"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </TabsTrigger>
                <TabsTrigger 
                  value="file"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium text-sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger 
                  value="barcode"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600 font-medium text-sm"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Barcode
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="camera" className="space-y-3">
                <div className="space-y-3">
                  {/* Camera Preview */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden min-h-[200px]">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      controls={false}
                      className="w-full h-64 object-cover"
                      style={{ transform: 'scaleX(-1)', display: stream ? 'block' : 'none' }} // Mirror the video for better UX
                      onLoadStart={() => console.log('Video load started')}
                      onCanPlay={() => console.log('Video can play')}
                      onError={(e) => console.error('Video error:', e)}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Camera placeholder when not active */}
                    {!stream && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                            <Camera className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Camera Preview</p>
                            <p className="text-gray-500 text-sm">Start camera to see live feed</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Camera overlay with instructions - only show when stream is active */}
                    {stream && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-3 left-3 bg-green-600/90 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                          📷 Live Camera
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 bg-black/80 text-white px-3 py-2 rounded-lg text-xs text-center">
                          Point camera at food • Ensure good lighting • Tap capture when ready
                        </div>
                        {/* Focus indicator */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/50 rounded-lg pointer-events-none"></div>
                      </div>
                    )}
                  </div>

                  {/* Camera Controls */}
                  <div className="space-y-4">
                    {showDebug && (
                      <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg text-xs">
                        <p><strong>Debug Info:</strong></p>
                        <p>Stream: {stream ? 'Active' : 'Inactive'}</p>
                        <p>IsStartingCamera: {isStartingCamera ? 'Yes' : 'No'}</p>
                        <p>CameraError: {cameraError || 'None'}</p>
                        <p>VideoRef: {videoRef.current ? 'Ready' : 'Not Ready'}</p>
                        <p>Image: {image ? `Present (${image.length} chars)` : 'None'}</p>
                        <p>Image Start: {image ? image.substring(0, 30) + '...' : 'N/A'}</p>
                        <div className="mt-2 space-x-2">
                          <Button 
                            onClick={() => {
                              console.log('Current image state:', image);
                              console.log('Image type:', typeof image);
                              console.log('Image length:', image?.length);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Log Image State
                          </Button>
                          <Button 
                            onClick={() => {
                              if (image) {
                                analyzeFood();
                              } else {
                                toast.error('No image to analyze');
                              }
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Test Analysis
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {cameraError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <p className="text-red-700 text-sm font-medium">Camera Error</p>
                        </div>
                        <p className="text-red-600 text-sm mt-1">{cameraError}</p>
                      </div>
                    )}

                    {!stream ? (
                      <div className="text-center space-y-4">
                        <div className="space-y-3">
                          <Button 
                            onClick={startCamera} 
                            disabled={isStartingCamera}
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-700"
                          >
                            {isStartingCamera ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Starting Camera...
                              </>
                            ) : (
                              <>
                                <Camera className="w-4 h-4 mr-2" />
                                Start Camera
                              </>
                            )}
                          </Button>
                          
                          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>High Quality</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Real-time Analysis</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>Nutritional Insights</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-blue-600 text-sm">💡</span>
                            </div>
                            <div>
                              <p className="text-blue-800 font-medium text-sm">Pro Tip</p>
                              <p className="text-blue-700 text-sm">
                                Allow camera access when prompted for the best experience. Position your food in good lighting for accurate analysis.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Fallback button for debugging */}
                        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-xs text-yellow-800 mb-2">Debug: Camera not started</p>
                          <Button 
                            onClick={startCamera} 
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            Force Start Camera
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex space-x-3">
                          <Button 
                            onClick={capturePhoto} 
                            className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-green-700"
                          >
                            <Camera className="w-5 h-5 mr-2" />
                            📸 Capture Photo
                          </Button>
                          <Button 
                            onClick={stopCamera} 
                            variant="outline" 
                            className="px-6 h-12 border-2 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all duration-200 font-semibold"
                          >
                            <div className="w-5 h-5 mr-2 bg-red-500 rounded"></div>
                            Stop
                          </Button>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-green-800 font-semibold text-sm">
                              Camera Active - Position your food in the center frame and tap capture
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="file" className="space-y-3">
                <div className="text-center space-y-3">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-800">Upload Food Image</h3>
                        <p className="text-sm text-gray-600">Choose an image from your device for analysis</p>
                      </div>
                      
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700 h-11 px-8 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                      
                      <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>PNG</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>JPEG</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>GIF</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>WebP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 text-sm">✨</span>
                      </div>
                      <div>
                        <p className="text-purple-800 font-medium text-sm">Best Results</p>
                        <p className="text-purple-700 text-sm">
                          Use clear, well-lit images with the food item clearly visible for the most accurate analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="barcode" className="space-y-3">
                <div className="text-center space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-200 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <Scan className="w-8 h-8 text-purple-600" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-800">Scan Food Barcode</h3>
                        <p className="text-sm text-gray-600">Enter a barcode number to get detailed nutritional information</p>
                      </div>
                      
                      <div className="space-y-3">
                        <Input
                          type="text"
                          placeholder="Enter barcode number (e.g., 1234567890123)"
                          value={barcodeData}
                          onChange={(e) => setBarcodeData(e.target.value)}
                          className="text-center text-lg font-mono"
                        />
                        
                        <Button 
                          onClick={handleBarcodeSubmit}
                          disabled={isAnalyzing || !barcodeData.trim()}
                          className="w-full bg-purple-600 hover:bg-purple-700 h-11 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Analyzing Barcode...
                            </>
                          ) : (
                            <>
                              <Scan className="w-4 h-4 mr-2" />
                              🔍 Analyze Barcode
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>UPC</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>EAN</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>ISBN</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-600 text-sm">📱</span>
                      </div>
                      <div>
                        <p className="text-purple-800 font-medium text-sm">Barcode Analysis</p>
                        <p className="text-purple-700 text-sm">
                          Get instant nutritional information for packaged foods by scanning their barcode.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Image Preview */}
            {image && (
              <div className="space-y-6">
                <div className="relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
                  <img
                    src={image}
                    alt="Food to analyze"
                    className="max-w-full h-auto max-h-[80vh] w-full object-contain"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Ready for Analysis</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <Button 
                    onClick={() => analyzeFood()} 
                    disabled={isAnalyzing}
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Analyzing Food...
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5 mr-3" />
                        🍎 Analyze Food
                      </>
                    )}
                  </Button>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-800 font-medium text-sm">
                      🎯 AI-powered analysis will provide detailed nutritional insights and health recommendations
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Panel */}
        {showDebug && (
          <Card className="bg-gray-50 border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Image:</strong> {image ? 'Present' : 'Missing'}
                </div>
                <div>
                  <strong>Stream:</strong> {stream ? 'Active' : 'Inactive'}
                </div>
                <div>
                  <strong>Analyzing:</strong> {isAnalyzing ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Analysis:</strong> {analysis ? 'Complete' : 'None'}
                </div>
              </div>
              <div className="pt-2 space-x-2">
                <Button
                  onClick={() => {
                    console.log('Video ref:', videoRef.current);
                    console.log('Stream:', stream);
                    console.log('User agent:', navigator.userAgent);
                    console.log('Media devices:', navigator.mediaDevices);
                    console.log('Location:', location.href);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Log Camera Info
                </Button>
                <Button
                  onClick={() => {
                    console.log('Current image:', image ? 'Present' : 'Missing');
                    console.log('Current analysis:', analysis);
                    console.log('Is analyzing:', isAnalyzing);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Log Analysis Info
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Overall Health Score */}
            <Card className="bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-200">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                    {getHealthScoreIcon(analysis.overallHealthScore)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Overall Health Score</h2>
                    <p className="text-sm text-gray-600">Comprehensive nutritional assessment</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className={`text-6xl font-black ${getHealthScoreColor(analysis.overallHealthScore)} drop-shadow-lg`}>
                    {analysis.overallHealthScore}
                  </div>
                  <div className="space-y-1">
                    <Progress 
                      value={analysis.overallHealthScore} 
                      className="w-full h-4 bg-gray-200 rounded-full overflow-hidden"
                    />
                    <p className={`text-lg font-semibold ${
                      analysis.overallHealthScore >= 80 ? 'text-green-600' : 
                      analysis.overallHealthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {analysis.overallHealthScore >= 80 ? '🌟 Excellent' : 
                       analysis.overallHealthScore >= 60 ? '👍 Good' : '⚠️ Needs Improvement'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Food Items Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {analysis.foodItems.map((item, index) => (
                <Card key={index} className="bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Utensils className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{item.name}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${getHealthScoreColor(item.healthScore)} border font-medium px-2 py-1 text-xs`}
                      >
                        {item.healthScore}/100
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                      Confidence: {(item.confidence * 100).toFixed(1)}% • AI Analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Nutritional Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2 flex items-center text-sm">
                        <Heart className="w-3 h-3 mr-1 text-red-500" />
                        Nutritional Information
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="text-gray-600 text-xs font-medium uppercase tracking-wide">Calories</div>
                          <div className="text-sm font-bold text-gray-900">{item.calories}</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="text-gray-600 text-xs font-medium uppercase tracking-wide">Protein</div>
                          <div className="text-sm font-bold text-gray-900">{item.nutritionalInfo.protein}g</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="text-gray-600 text-xs font-medium uppercase tracking-wide">Carbs</div>
                          <div className="text-sm font-bold text-gray-900">{item.nutritionalInfo.carbs}g</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="text-gray-600 text-xs font-medium uppercase tracking-wide">Fat</div>
                          <div className="text-sm font-bold text-gray-900">{item.nutritionalInfo.fat}g</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="text-gray-600 text-xs font-medium uppercase tracking-wide">Fiber</div>
                          <div className="text-sm font-bold text-gray-900">{item.nutritionalInfo.fiber}g</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="text-gray-600 text-xs font-medium uppercase tracking-wide">Sodium</div>
                          <div className="text-sm font-bold text-gray-900">{item.nutritionalInfo.sodium}mg</div>
                        </div>
                      </div>
                    </div>

                    {/* Sugar Analysis - Prominent Display */}
                    <div className="bg-gradient-to-r from-pink-50 to-red-50 border border-pink-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-pink-800 flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          Sugar Content
                        </h4>
                        <Badge 
                          variant={item.nutritionalInfo.sugar > 25 ? "destructive" : item.nutritionalInfo.sugar > 15 ? "secondary" : "default"}
                          className="text-sm"
                        >
                          {item.nutritionalInfo.sugar}g
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Daily Value (25g)</span>
                          <span className="font-medium">
                            {((item.nutritionalInfo.sugar / 25) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={(item.nutritionalInfo.sugar / 25) * 100} 
                          className="w-full h-2"
                        />
                        <div className="text-xs text-pink-700">
                          {item.nutritionalInfo.sugar > 25 ? 
                            "⚠️ High sugar content - exceeds daily recommendation" :
                            item.nutritionalInfo.sugar > 15 ? 
                            "⚡ Moderate sugar content" : 
                            "✅ Low sugar content - good choice!"
                          }
                        </div>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <h4 className="font-medium mb-2">Ingredients:</h4>
                      <div className="flex flex-wrap gap-1">
                        {item.ingredients.map((ingredient, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Allergens */}
                    {item.allergens.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Allergens:</h4>
                        <div className="flex flex-wrap gap-1">
                          {item.allergens.map((allergen, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Location & Restaurant Info */}
            {analysis.location && (
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>Location & Restaurant Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Address:</span> {analysis.location.address}
                    </div>
                    {analysis.location.restaurant && (
                      <div>
                        <span className="font-medium">Restaurant:</span> {analysis.location.restaurant}
                      </div>
                    )}
                    {analysis.location.menuItems && analysis.location.menuItems.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Menu Items:</h4>
                        <div className="space-y-2">
                          {analysis.location.menuItems.map((menuItem, idx) => (
                            <div key={idx} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{menuItem.name}</div>
                                  <div className="text-sm text-gray-600">{menuItem.description}</div>
                                </div>
                                <div className="font-bold text-green-600">{menuItem.price}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span>Health Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
