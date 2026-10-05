import React, { useEffect, useRef, useState } from 'react'
import { drawText, measure } from './font'
import { H, W, rect } from './fx'
import { draw, hedgehog } from './sprites'

// What the panel says as the bar fills, in the order the sound arrives.
const STATUS = [
    [0.25, 'TUNING THE CHIPTUNES'],
    [0.5, 'WAKING THE ROBOTS'],
    [0.75, 'FEEDING THE HEDGEHOG'],
    [1, 'PLUGGING IN THE MCP'],
] as const

const PANEL = { x: 36, y: 104, width: 248, height: 46 }
const BAR = { x: 60, y: 128, segments: 20, segmentWidth: 9, height: 10 }
const TICK_MS = 120

const centered = (text: string): number => Math.round((W - measure(text)) / 2)

// A small panel along the bottom of the scene, so the video stays visible behind it.
function paint(ctx: CanvasRenderingContext2D, progress: number, tick: number): void {
    ctx.clearRect(0, 0, W, H)
    ctx.globalAlpha = 0.92
    rect(ctx, 'k', PANEL.x, PANEL.y, PANEL.width, PANEL.height)
    ctx.globalAlpha = 1
    rect(ctx, 'g', PANEL.x, PANEL.y, PANEL.width, 1)
    rect(ctx, 'g', PANEL.x, PANEL.y + PANEL.height - 1, PANEL.width, 1)

    const done = progress >= 1
    const status = done ? 'PRESS START' : (STATUS.find(([limit]) => progress < limit)?.[1] ?? 'PRESS START')
    drawText(ctx, status, centered(status), PANEL.y + 7, { color: done && tick % 4 < 2 ? 'y' : 'S' })

    // The track and its segments, filled left to right, with the next one flickering to show it is working.
    const width = BAR.segments * (BAR.segmentWidth + 1) - 1
    rect(ctx, 'g', BAR.x - 1, BAR.y - 1, width + 2, BAR.height + 2)
    rect(ctx, 'd', BAR.x, BAR.y, width, BAR.height)
    const filled = Math.floor(progress * BAR.segments)
    for (let i = 0; i < BAR.segments; i++) {
        const x = BAR.x + i * (BAR.segmentWidth + 1)
        if (i < filled) {
            rect(ctx, 'o', x, BAR.y, BAR.segmentWidth, BAR.height)
            rect(ctx, 'y', x, BAR.y, BAR.segmentWidth, 2)
        } else if (i === filled && !done && tick % 4 < 2) {
            rect(ctx, 'g', x, BAR.y, BAR.segmentWidth, BAR.height)
        }
    }

    // The hedgehog rides the front of the bar along the top of the panel, hopping and waving.
    const hog = hedgehog(tick % 4 < 2 ? 'waveA' : 'waveB', tick % 17 === 0)
    const hop = Math.round(Math.abs(Math.sin(tick / 1.6)) * 3)
    draw(ctx, hog, BAR.x - 2 + progress * (width - hog.w + 4), PANEL.y - hog.h + 1 - hop)
}

export default function LoadingScreen({ progress }: { progress: number }): JSX.Element {
    const canvas = useRef<HTMLCanvasElement>(null)
    const [tick, setTick] = useState(0)
    const percent = Math.round(progress * 100)

    useEffect(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const timer = setInterval(() => setTick((t) => t + 1), TICK_MS)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const ctx = canvas.current?.getContext('2d')
        if (!ctx) return
        ctx.imageSmoothingEnabled = false
        paint(ctx, progress, tick)
    }, [progress, tick])

    return (
        <div
            role="progressbar"
            aria-label="Loading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="pointer-events-none absolute inset-0"
        >
            <canvas
                ref={canvas}
                width={W}
                height={H}
                aria-hidden="true"
                className="size-full object-contain [image-rendering:pixelated]"
            />
        </div>
    )
}
