import { Meteor } from "meteor/meteor";
import assert from "assert";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { setupGestureRecognizer, useGestureDetector } from "/imports/mediapipe/gestures";
import type { GestureRecognizer } from "@mediapipe/tasks-vision";
import { GestureType, FunctionType } from "/imports/gesture/gesture";

const ImageGestureHarness: React.FC<{
  src: string;
  recognizer: GestureRecognizer;
  expected: GestureType;
  onDone: (err?: Error) => void;
}> = ({ src, recognizer, expected, onDone }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);

  const settings = useMemo<Record<GestureType, FunctionType>>(() => {
    const map = {} as Record<GestureType, FunctionType>;
    for (const key of Object.values(GestureType)) {
      map[key as GestureType] = FunctionType.UNUSED as FunctionType;
    }
    return map;
  }, []);

  const { currentGestures: gestures, gesturesRef } = useGestureDetector(
    recognizer, videoRef, imageRef, true, settings, "IMAGE", false
  );

  useEffect(() => {
    gesturesRef.current = gestures;
  }, [gestures]);

  // --- wait for image to be fully decoded and painted ---
  const handleImageLoad = useCallback(async () => {
    const el = imageRef.current;
    if (!el) return;
    try {
      // Ensure decode & layout are complete
      await el.decode();
    } catch {}
    if (el.naturalWidth === 0 || el.naturalHeight === 0) {
      onDone(new Error(`Image loaded with zero dimensions: ${src}`));
      return;
    }
    console.log(`[Test] Image decoded (${el.naturalWidth}x${el.naturalHeight})`);
    el.width = el.naturalWidth;
    el.height = el.naturalHeight;
    // Force paint flush
    requestAnimationFrame(() => {
      setTimeout(() => setReady(true), 200);
    });
  }, [onDone, src]);

  const handleImageError = useCallback(() => {
    onDone(new Error("Failed to load image: " + src));
  }, [onDone, src]);

  useEffect(() => {
    if (!ready) return;
    const MAX_WAIT_MS = 15000;
    const POLL_MS = 400;
    const start = Date.now();

    console.log(`[Test] Starting recognition wait loop for ${src}`);
    const int = setInterval(() => {
      const gs = gesturesRef.current ?? [];
      const firstGestureType = gs[0]?.gestureID;
      if (firstGestureType !== undefined) {
        clearInterval(int);
        try {
          console.log(`[Test] Result for ${src}: ${GestureType[firstGestureType]} (expected ${GestureType[expected]})`);
          assert.strictEqual(firstGestureType, expected);
          onDone();
        } catch (e) {
          console.error(`[Test] Assertion failed for ${src}.`, {
            expected: GestureType[expected],
            received: GestureType[firstGestureType],
          });
          onDone(e as Error);
        }
      } else if (Date.now() - start > MAX_WAIT_MS) {
        clearInterval(int);
        console.error(`[Test] Timeout waiting for gesture for ${src}`);
        onDone(new Error(`Timeout for ${src}`));
      }
    }, POLL_MS);
    return () => clearInterval(int);
  }, [ready, expected, onDone]);

  return React.createElement("img", {
    ref: imageRef,
    src,
    alt: "gesture test",
    crossOrigin: "anonymous",
    style: {
      visibility: "hidden",
      position: "absolute",
      left: "-9999px",
      width: "auto",
      height: "auto"
    },
    onLoad: handleImageLoad,
    onError: handleImageError
  });
};

if (Meteor.isClient) {
  describe("Gesture recognition from images (IMAGE mode)", function () {
    this.timeout(60000);

    const testCases: { src: string; expected: GestureType }[] = [
      { src: "/images/integrationtests/thumbs_up.jpg", expected: GestureType.THUMB_UP },
      { src: "/images/integrationtests/thumbs_down.jpg", expected: GestureType.THUMB_DOWN },
      { src: "/images/integrationtests/pointing_up.jpg", expected: GestureType.POINTING_UP },
      { src: "/images/integrationtests/double_point_left.jpg", expected: GestureType.TWO_FINGER_POINTING_LEFT },
      { src: "/images/integrationtests/double_point_right.jpg", expected: GestureType.TWO_FINGER_POINTING_RIGHT },
      { src: "/images/integrationtests/open_palm.jpg", expected: GestureType.OPEN_PALM },
      { src: "/images/integrationtests/fist.jpg", expected: GestureType.CLOSED_FIST },
      { src: "/images/integrationtests/pinch.jpg", expected: GestureType.PINCH },
      { src: "/images/integrationtests/victory.png", expected: GestureType.VICTORY },
    ];

    it("recognises gestures from images sequentially with shared recognizer", async function () {
      const rec = await setupGestureRecognizer("IMAGE");
      if (!rec) throw new Error("GestureRecognizer failed to initialize");

      for (const { src, expected } of testCases) {
        await new Promise<void>((resolve, reject) => {
          const container = document.createElement("div");
          document.body.appendChild(container);
          const root = createRoot(container);

          function handleDone(err?: Error) {
            root.unmount();
            container.remove();
            if (err) reject(err);
            else resolve();
          }

          root.render(
            React.createElement(ImageGestureHarness, {
              src,
              recognizer: rec,
              expected,
              onDone: handleDone,
            })
          );
        });
      }
    });
  });
}
