'use client'
import { useState, useEffect } from 'react';
import { Gesture, GestureType, defaultMapping, IDtoEnum } from "imports/gesture/gesture";
import { setCookie, getCookie } from "imports/settings/cookies";

// Use the same action types as your existing defaultMapping
type GestureHandler = (initialGesture: Gesture, latestGesture: Gesture) => void;

export const useGestureSettings = () => {
  const [mappings, setMappings] = useState<Record<GestureType, GestureHandler>>(defaultMapping)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from cookie on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = getCookie('gestureSettings')
        if (saved) {
          const parsed = JSON.parse(saved)
          // Start with default mappings
          const validatedMappings = { ...defaultMapping }
          
          // Override with saved mappings where valid
          Object.entries(parsed).forEach(([gestureName, handlerName]) => {
            // Find the GestureType that matches this label
            const gestureEntry = Object.entries(IDtoEnum).find(
              ([_, label]) => label === gestureName
            );
            
            if (gestureEntry) {
              const gestureType = Number(gestureEntry[0]) as GestureType;
              if (typeof handlerName === 'string') {
                // Map the saved handler name to actual function
                switch(handlerName) {
                  case 'console.log':
                    validatedMappings[gestureType] = console.log;
                    break;
                  // Add cases for other handlers if you implement them
                  default:
                    validatedMappings[gestureType] = console.log;
                }
              }
            }
          })
          
          setMappings(validatedMappings)
        }
      } catch (e) {
        console.error('Failed to load gesture settings', e)
      }
      setIsInitialized(true)
    }
    loadSettings()
  }, [])

  const updateMapping = (gesture: GestureType, handler: GestureHandler) => {
    const newMappings = { ...mappings, [gesture]: handler }
    setMappings(newMappings)
  }

  const saveSettings = () => {
    try {
      // Convert to serializable format using labelMapping names
      const serialized: Record<string, string> = {};
      Object.entries(mappings).forEach(([gesture, handler]) => {
        const gestureType = Number(gesture) as GestureType;
        const gestureName = IDtoEnum[gestureType];
        serialized[gestureName] = handler === console.log ? 'console.log' : 'console.log'; // Update if you add other handlers
      });
      
      setCookie('gestureSettings', JSON.stringify(serialized), 365)
      return true
    } catch (e) {
      console.error('Failed to save gesture settings', e)
      return false
    }
  }

  return {
    mappings,
    updateMapping,
    saveSettings,
    isInitialized,
    gestureTypes: Object.values(GestureType).filter(v => typeof v === 'number') as GestureType[],
    labelMapping: IDtoEnum // Export labelMapping for UI use
  }
}