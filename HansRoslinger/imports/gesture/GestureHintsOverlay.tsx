import React, { useEffect, useMemo, useRef, useState } from "react";

type HintID = "select" | "filter" | "clear" | "zoom" | "click" | "switch";

type Props = {
    chartRootId?: string;
    delayMs?: number;
    repeatDelayMs?: number;
    fallback?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
    maxShown?: number;
};

const ICONS: Record<HintID, JSX.Element> = {
    select: (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M3 3l7 4 4 7-7-4-4-7zm7 4l11 11-3 3L7 10" />
        </svg>
    ),
    filter: (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
        </svg>
    ),
    clear: (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M6 19l12-12M6 7l12 12" />
        </svg>
    ),
    zoom: (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M10 4a6 6 0 014.8 9.6l4.8 4.8-1.6 1.6-4.8-4.8A6 6 0 1110 4zm0 2a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
    ),
    click: (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M12 2v9l3-3m-3 3l-3-3" />
        </svg>
    ),
    switch: (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M7 7h10v4H7zM7 13h10v4H7z" />
        </svg>
    ),
};

const CORNER_OFFSET = 12;

export default function GestureHintsOverlay({
    chartRootId = "chart-root",
    delayMs = 1200,
    repeatDelayMs = 1500,
    fallback = "bottom-left",
    maxShown = 3,
}: Props) {
    const [visible, setVisible] = useState(false);
    const [hints, setHints] = useState<HintID[]>([]);
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
    const [lastAction, setLastAction] = useState<HintID | null>(null);
    const timerRef = useRef<number | null>(null);
    const lastShownAtRef = useRef<number>(0);
    const rootRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        rootRef.current = document.getElementById(chartRootId) as HTMLElement | null;
    }, [chartRootId]);

    const clearTimer = () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = null;
    };

    const hide = () => {
        clearTimer();
        setVisible(false);
    };

    const cornerPosition = useMemo(() => {
        const r = rootRef.current?.getBoundingClientRect();
        if (!r) return { x: 0, y: 0 };
        const map = {
            "bottom-left": { x: r.left + CORNER_OFFSET, y: r.bottom - CORNER_OFFSET },
            "bottom-right": { x: r.right - CORNER_OFFSET, y: r.bottom - CORNER_OFFSET },
            "top-left": { x: r.left + CORNER_OFFSET, y: r.top + CORNER_OFFSET },
            "top-right": { x: r.right - CORNER_OFFSET, y: r.top + CORNER_OFFSET },
        } as const;
        return map[fallback];
    }, [fallback, rootRef.current]);

    type Role = "bar" | "axis" | "chart" | "none";
    type Features = {
        x: number;
        y: number;
        numHands: number;
        pinch: boolean;
        speed: number;
        handsDistance: number;
        overElementRole: Role;
    };

    function baseSet(role: Role): HintID[] {
        if (role === "bar") return ["select", "filter", "clear", "click", "zoom"];
        if (role === "axis") return ["zoom", "switch", "clear"];
        if (role === "chart") return ["zoom", "switch", "clear", "select"];
        return [];
    }

    function scoreHints(f: Features, last: HintID | null): Array<{ id: HintID; score: number }> {
        const set = new Set<HintID>(baseSet(f.overElementRole));
        if (f.numHands >= 2) set.add("zoom");

        const s = new Map<HintID, number>();
        for (const id of set) s.set(id, 0);

        if (f.numHands >= 2) s.set("zoom", (s.get("zoom") || 0) + 2.0);
        if (f.pinch) {
            s.set("select", (s.get("select") || 0) + 1.2);
            if (f.overElementRole === "bar") s.set("filter", (s.get("filter") || 0) + 0.8);
            s.set("click", (s.get("click") || 0) + 0.6);
        }
        if (f.speed < 0.25) {
            if (f.overElementRole === "bar") {
                s.set("filter", (s.get("filter") || 0) + 0.7);
                s.set("select", (s.get("select") || 0) + 0.4);
            } else {
                s.set("zoom", (s.get("zoom") || 0) + 0.3);
            }
        }
        if (last && s.has(last)) s.set(last, (s.get(last) || 0) + 0.25);

        const arr = [...s.entries()].map(([id, score]) => ({ id, score }));
        arr.sort((a, b) => b.score - a.score);
        return arr;
    }

    useEffect(() => {
        const onPreIntent = (e: Event) => {
            if (!rootRef.current) return;
            const d = (e as CustomEvent).detail as Features;
            const rect = rootRef.current.getBoundingClientRect();
            const inside = d.x >= rect.left && d.x <= rect.right && d.y >= rect.top && d.y <= rect.bottom;
            if (!inside) {
                hide();
                return;
            }

            const ranked = scoreHints(d, lastAction);
            const nextHints = ranked.slice(0, maxShown).map((x) => x.id);

            const now = performance.now();
            const waiting = (visible ? repeatDelayMs : delayMs) - (now - lastShownAtRef.current);
            clearTimer();
            timerRef.current = window.setTimeout(() => {
                setHints(nextHints);
                setPos({ x: d.x + 12, y: d.y + 12 });
                setVisible(true);
                lastShownAtRef.current = performance.now();
            }, Math.max(0, waiting));
        };

        const onPointer = (e: Event) => {
            const { x, y } = (e as CustomEvent).detail as { x: number; y: number };
            if (!rootRef.current) return;
            const rect = rootRef.current.getBoundingClientRect();
            const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
            if (!inside) {
                hide();
                return;
            }
            setPos({ x: x + 12, y: y + 12 });
        };

        window.addEventListener("gesture:preintent", onPreIntent);
        window.addEventListener("gesture:pointer", onPointer);
        return () => {
            window.removeEventListener("gesture:preintent", onPreIntent);
            window.removeEventListener("gesture:pointer", onPointer);
        };
    }, [visible, delayMs, repeatDelayMs, lastAction, maxShown]);

    useEffect(() => {
        let forgetTimer: number | null = null;
        const setLast = (id: HintID) => () => {
            setLastAction(id);
            if (forgetTimer) window.clearTimeout(forgetTimer);
            forgetTimer = window.setTimeout(() => setLastAction(null), 8000) as unknown as number;
            hide();
        };
        const bindings: Array<[string, HintID]> = [
            ["chart:filter", "filter"],
            ["chart:zoom", "zoom"],
            ["chart:switch", "switch"],
            ["gesture:action", "click"],
            ["chart:clear", "clear"],
            ["chart:select", "select"],
        ];
        bindings.forEach(([evt, id]) => window.addEventListener(evt, setLast(id)));
        return () =>
            bindings.forEach(([evt, id]) =>
                window.removeEventListener(evt, setLast(id))
            );
    }, []);

    if (!visible) return null;

    const style: React.CSSProperties = pos
        ? { left: pos.x, top: pos.y, transform: "translate(-10%, -110%)" }
        : { left: cornerPosition.x, top: cornerPosition.y, transform: "translate(0, 0)" };

    return (
        <div
            aria-label="gesture-hints"
            className="pointer-events-none fixed z-[10000]"
            style={style}
        >
            <div className="flex gap-2 rounded-2xl px-3 py-2 bg-black/70 text-white shadow-lg backdrop-blur">
                {hints.map((h, i) => (
                    <div
                        key={h}
                        className={`flex items-center gap-1 ${i === 0 ? "opacity-100 scale-100" : "opacity-80"
                            }`}
                    >
                        {ICONS[h]}
                        <span className="text-xs capitalize">{h}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
