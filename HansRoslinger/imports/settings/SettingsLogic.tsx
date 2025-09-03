"use client";
import { useState, useEffect } from "react";
import {
  GestureType,
  FunctionType,
  EnumToFunc,
} from "imports/gesture/gesture";
import { setCookie, getCookie } from "imports/settings/cookies";

// Use the same action types as your existing defaultMapping
type GestureFunctionMapping = Record<GestureType, FunctionType>;

export const useGestureSettings = () => {
  const [mappings, setMappings] =
    useState<GestureFunctionMapping>({
          [GestureType.THUMB_UP]: FunctionType.UNUSED,
          [GestureType.THUMB_DOWN]: FunctionType.UNUSED,
          [GestureType.POINTING_UP]: FunctionType.SELECT,
          [GestureType.CLOSED_FIST]: FunctionType.CLEAR,
          [GestureType.I_LOVE_YOU]: FunctionType.UNUSED,
          [GestureType.UNIDENTIFIED]: FunctionType.UNUSED,
          [GestureType.OPEN_PALM]: FunctionType.FILTER,
          [GestureType.VICTORY]: FunctionType.ZOOM,
          });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from cookie on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await getCookie("gestureSettings");
        if (saved) {
          const parsed = JSON.parse(saved.data);
          const loadedMappings = { ...{
                [GestureType.THUMB_UP]: FunctionType.UNUSED,
                [GestureType.THUMB_DOWN]: FunctionType.UNUSED,
                [GestureType.POINTING_UP]: FunctionType.SELECT,
                [GestureType.CLOSED_FIST]: FunctionType.CLEAR,
                [GestureType.I_LOVE_YOU]: FunctionType.UNUSED,
                [GestureType.UNIDENTIFIED]: FunctionType.UNUSED,
                [GestureType.OPEN_PALM]: FunctionType.FILTER,
                [GestureType.VICTORY]: FunctionType.ZOOM,
                } };

          // Convert string keys back to enums
          Object.entries(parsed).forEach(([gestureKey, functionKey]) => {
            const gestureType = parseInt(gestureKey) as GestureType;
            const functionType = parseInt(
              functionKey as string,
            ) as FunctionType;

            if (gestureType in GestureType && functionType in FunctionType) {
              loadedMappings[gestureType] = functionType;
            }
          });

          setMappings(loadedMappings);
        }
      } catch (e) {
        console.error("Failed to load gesture settings", e);
      }
      setIsInitialized(true);
    };
    loadSettings();
  }, []);

  const updateMapping = (gesture: GestureType, func: FunctionType) => {
    const newMappings = { ...mappings, [gesture]: func };
    setMappings(newMappings);
  };

  const saveSettings = async () => {
    try {
      // Convert enum keys to strings for cookie storage
      const serialized: Record<string, number> = {};
      Object.entries(mappings).forEach(([gesture, func]) => {
        serialized[gesture] = func;
      });

      await setCookie("gestureSettings", serialized);
      return true;
    } catch (e) {
      console.error("Failed to save gesture settings", e);
      return false;
    }
  };

  return {
    mappings,
    updateMapping,
    saveSettings,
    isInitialized,
    gestureTypes: Object.values(GestureType).filter(
      (v) => typeof v === "number",
    ) as GestureType[],
    functionTypes: Object.values(FunctionType).filter(
      (v) => typeof v === "number",
    ) as FunctionType[],
    getHandler: (gestureType: GestureType) => EnumToFunc[mappings[gestureType]],
  };
};
