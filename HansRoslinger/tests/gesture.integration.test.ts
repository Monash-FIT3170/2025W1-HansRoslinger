import { Meteor } from "meteor/meteor";
import assert from "assert";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { setupGestureRecognizer, useGestureDetector } from "/imports/mediapipe/gestures";
import type { GestureRecognizer } from "@mediapipe/tasks-vision";
import { GestureType, FunctionType, Gesture } from "/imports/gesture/gesture";

// A tiny harness component to run the real hook against an HTMLImageElement
const ImageGestureHarness: React.FC<{ src: string; onDone: (gestureType: GestureType | undefined) => void }> = ({ src, onDone }) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);
	const [recognizer, setRecognizer] = useState<GestureRecognizer | null>(null);
	const [imageLoaded, setImageLoaded] = useState(false);

	const settings = useMemo<Record<GestureType, FunctionType>>(() => {
		const map = {} as Record<GestureType, FunctionType>;
		for (const key of Object.values(GestureType)) {
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
			console.log("[Test] Image loaded", { width: img.width, height: img.height, src });
		};
		img.onerror = (e) => {
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
			const firstGestureType = gs.length > 0 ? gs[0].gestureID : undefined;
			if (firstGestureType !== undefined || Date.now() - start > MAX_WAIT_MS) {
				console.log("[Test] Recognized gesture type (final):", firstGestureType);
				clearInterval(int);
				onDone(firstGestureType);
			}
		}, POLL_MS);
		return () => clearInterval(int);
	}, [recognizer, imageLoaded, gestures, onDone]);

	return null;
};

if (Meteor.isClient) {
	describe("Gesture recognition from image (IMAGE mode)", function () {
		this.timeout(60000);

		it("loads an image and returns the recognized gesture type", (done) => {
			const container = document.createElement("div");
			document.body.appendChild(container);
			const root = createRoot(container);

			const imagePath = "/images/integrationtests/thumbs_up.jpg";

			function handleDone(gestureType: GestureType | undefined) {
				try {
					assert.strictEqual(gestureType, GestureType.THUMB_UP, "Expected to recognize a THUMB_UP gesture from the image");
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

		it("loads an image and returns the recognized gesture type", (done) => {
			const container = document.createElement("div");
			document.body.appendChild(container);
			const root = createRoot(container);

			const imagePath = "/images/integrationtests/thumbs_down.jpg";

			function handleDone(gestureType: GestureType | undefined) {
				try {
					assert.strictEqual(gestureType, GestureType.THUMB_DOWN, "Expected to recognize a THUMB_DOWN gesture from the image");
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

		it("simple sanity test", function () {
			assert.strictEqual(true, true, "True should be true");
		});
	});
}

