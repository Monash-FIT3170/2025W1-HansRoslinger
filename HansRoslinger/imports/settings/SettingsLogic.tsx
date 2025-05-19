'use client'
import { useState, useEffect } from 'react';
import { Gesture, GestureType, defaultMapping } from "imports/gesture/gesture";
// import { setCookie, getCookie } from "utils/cookies";

// Use the same action types as your existing defaultMapping
type GestureHandler = (initialGesture: Gesture, latestGesture: Gesture) => void;

export const useGestureSettings = () => {
  const [mappings, setMappings] = useState<Record<GestureType, GestureHandler>>(defaultMapping)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from cookie on mount(Load settings)
  
          
        // Override with saved mappings if they exist
       

  
 
  // Save settings
  

  
}