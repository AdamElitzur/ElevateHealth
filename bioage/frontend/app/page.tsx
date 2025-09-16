'use client'

import { useState, useRef, useEffect } from 'react'
import CameraComponent from './components/CameraComponent'

export default function Home() {
  return (
    <main className="container">
      <h1>BioAge Camera Analysis</h1>
      <p>Capture your photo to get your biological age analysis</p>
      <CameraComponent />
    </main>
  )
}

