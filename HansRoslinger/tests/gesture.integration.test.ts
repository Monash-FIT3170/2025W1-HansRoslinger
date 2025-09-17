import { Meteor } from "meteor/meteor";
import assert from "assert";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { setupGestureRecognizer, useGestureDetector } from "/imports/mediapipe/gestures";
import type { GestureRecognizer } from "@mediapipe/tasks-vision";
import { GestureType, FunctionType, Gesture } from "/imports/gesture/gesture";

// A tiny harness component to run the real hook against an HTMLImageElement
const ImageGestureHarness: React.FC<{ src: string; onDone: (gestures: Gesture[]) => void }> = ({ src, onDone }) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);
	const [recognizer, setRecognizer] = useState<GestureRecognizer | null>(null);
	const [imageLoaded, setImageLoaded] = useState(false);

		const settings = useMemo<Record<GestureType, FunctionType>>(() => {
			const map = {} as Record<GestureType, FunctionType>;
		for (const key of Object.values(GestureType)) {
				// Assign everything to UNUSED for the test mapping
				map[key as GestureType] = FunctionType.UNUSED as FunctionType;
		}
		return map;
	}, []);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const rec = await setupGestureRecognizer("IMAGE");
			if (!cancelled) {
				setRecognizer(rec);
				// eslint-disable-next-line no-console
				console.log("[Test] Recognizer ready (IMAGE)", !!rec);
			}
		})();
			return () => {
				cancelled = true;
				recognizer?.close?.();
			};
	}, []);

	useEffect(() => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			imageRef.current = img;
			setImageLoaded(true);
			// eslint-disable-next-line no-console
			console.log("[Test] Image loaded", { width: img.width, height: img.height, src });
		};
		img.onerror = (e) => {
			// eslint-disable-next-line no-console
			console.error("[Test] Failed to load image", e);
			setImageLoaded(false);
		};
		img.src = src;
	}, [src]);

	const gestures = useGestureDetector(recognizer, videoRef, imageRef, true, settings, "IMAGE");

		useEffect(() => {
			if (!recognizer || !imageLoaded) return;
			const MAX_WAIT_MS = 15000;
			const POLL_MS = 400;
			const start = Date.now();
			const int = setInterval(() => {
				const gs = (gestures as Gesture[]) ?? [];
				const hasThumbUp = gs.some((g) => g.gestureID === GestureType.THUMB_UP);
				if (hasThumbUp || Date.now() - start > MAX_WAIT_MS) {
					// eslint-disable-next-line no-console
					console.log("[Test] Recognized gestures (final):", gs.map((g) => g.gestureID));
					clearInterval(int);
					onDone(gs);
				}
			}, POLL_MS);
			return () => clearInterval(int);
		}, [recognizer, imageLoaded, gestures, onDone]);

	return null;
};

if (Meteor.isClient) {
	describe("Gesture recognition from image (IMAGE mode)", function () {
		this.timeout(60000);

			it("loads an image and prints the recognized gesture(s)", (done) => {
			const container = document.createElement("div");
				document.body.appendChild(container);
				const root = createRoot(container);

			const imagePath = "/images/integrationtests/thumbs_up.jpg"; // Replace with a real hand image for meaningful output

					function handleDone(gestures: Gesture[]) {
				try {
					assert.strictEqual(Array.isArray(gestures), true, "gestures should be an array");
					const hasThumbUp = gestures.some((g) => g.gestureID === GestureType.THUMB_UP);
					assert.strictEqual(hasThumbUp, true, "Expected to recognize a THUMB_UP gesture from the image");
				} catch (e) {
							done(e as Error);
					return;
				} finally {
							root.unmount();
							container.remove();
				}
				done();
			}

					root.render(React.createElement(ImageGestureHarness, { src: imagePath, onDone: handleDone }));
		});
	});
}

