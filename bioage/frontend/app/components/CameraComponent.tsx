'use client'

import { useState, useRef, useEffect } from 'react'

interface BioAgeResult {
  timestamp: string
  age: number
  face_bbox: {
    x: number
    y: number
    width: number
    height: number
  } | null
  confidence?: number
  face_detected?: boolean
  image_stats?: {
    width: number
    height: number
    brightness: number
    color_variance: number
    skin_ratio: number
  }
  message?: string
}

export default function CameraComponent() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [bioAgeResult, setBioAgeResult] = useState<BioAgeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  const WEBSOCKET_URL = 'ws://localhost:8001/ws'

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (ws) {
        ws.close()
      }
    }
  }, [stream, ws])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setError(null)
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const connectWebSocket = () => {
    try {
      const websocket = new WebSocket(WEBSOCKET_URL)
      
      websocket.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
      }

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Received bioage data:', data)
          
          if (data.error) {
            setError(data.error)
            setIsAnalyzing(false)
            return
          }
          
          if (data.age !== undefined) {
            setBioAgeResult(data)
            setIsAnalyzing(false)
            setError(null)
          } else if (data.message) {
            // Handle other response types
            setBioAgeResult({
              timestamp: new Date().toISOString(),
              age: 0,
              face_bbox: null,
              message: data.message
            })
            setIsAnalyzing(false)
            setError(null)
          }
        } catch (err) {
          console.error('Error parsing WebSocket data:', err)
          setError('Failed to parse response from server')
          setIsAnalyzing(false)
        }
      }

      websocket.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Failed to connect to analysis service')
        setIsConnected(false)
      }

      setWs(websocket)
    } catch (err) {
      setError('Failed to establish connection')
      console.error('WebSocket connection error:', err)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.8)
    
    // Send to WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      setIsAnalyzing(true)
      setBioAgeResult(null)
      ws.send(base64Image)
    } else {
      setError('Not connected to analysis service')
    }
  }

  const disconnectWebSocket = () => {
    if (ws) {
      ws.close()
      setWs(null)
      setIsConnected(false)
    }
  }

  return (
    <div className="camera-container">
      <div className="status">
        {isConnected ? (
          <div className="status connected">Connected to Analysis Service</div>
        ) : (
          <div className="status disconnected">Disconnected</div>
        )}
        {isAnalyzing && (
          <div className="status analyzing">Analyzing your photo...</div>
        )}
        {error && (
          <div className="status disconnected">{error}</div>
        )}
      </div>

      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="video"
          style={{ display: stream ? 'block' : 'none' }}
        />
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        {!stream && (
          <div style={{ 
            width: '100%', 
            height: '300px', 
            background: '#f0f0f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '12px'
          }}>
            <p>Camera not started</p>
          </div>
        )}
      </div>

      <div className="controls">
        {!stream ? (
          <button onClick={startCamera} className="btn btn-primary">
            Start Camera
          </button>
        ) : (
          <button onClick={stopCamera} className="btn btn-secondary">
            Stop Camera
          </button>
        )}

        {!isConnected ? (
          <button onClick={connectWebSocket} className="btn btn-primary">
            Connect to Analysis
          </button>
        ) : (
          <button onClick={disconnectWebSocket} className="btn btn-secondary">
            Disconnect
          </button>
        )}

        {stream && isConnected && (
          <button 
            onClick={capturePhoto} 
            className="capture-button"
            disabled={isAnalyzing}
          >
            📸
          </button>
        )}
      </div>

      {bioAgeResult && (
        <div className="results">
          <h3>BioAge Analysis Results</h3>
          <div className="bioage-result">
            <div className="age-display">
              <p>Biological Age: <strong>{bioAgeResult.age.toFixed(1)} years</strong></p>
              {bioAgeResult.confidence && (
                <p>Confidence: <strong>{(bioAgeResult.confidence * 100).toFixed(1)}%</strong></p>
              )}
            </div>
            
            <div className="analysis-details">
              <p>Analysis Time: {new Date(bioAgeResult.timestamp * 1000).toLocaleString()}</p>
              <p>Face Detection: {bioAgeResult.face_detected ? '✅ Detected' : '❌ Not detected'}</p>
              
              {bioAgeResult.face_bbox && (
                <div className="face-info">
                  <p>Face Position: x:{bioAgeResult.face_bbox.x}, y:{bioAgeResult.face_bbox.y}</p>
                  <p>Face Size: {bioAgeResult.face_bbox.width}×{bioAgeResult.face_bbox.height}</p>
                </div>
              )}
              
              {bioAgeResult.image_stats && (
                <div className="image-stats">
                  <h4>Image Analysis</h4>
                  <p>Resolution: {bioAgeResult.image_stats.width}×{bioAgeResult.image_stats.height}</p>
                  <p>Brightness: {bioAgeResult.image_stats.brightness.toFixed(1)}</p>
                  <p>Color Variance: {bioAgeResult.image_stats.color_variance.toFixed(1)}</p>
                  <p>Skin Ratio: {(bioAgeResult.image_stats.skin_ratio * 100).toFixed(1)}%</p>
                </div>
              )}
              
              {bioAgeResult.message && (
                <p className="analysis-message">{bioAgeResult.message}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
