import React, { useEffect, useRef, useState } from 'react'
import { drawText, measure } from './font'
import { H, W, rect } from './fx'
import { PALETTE } from './palette'
import { draw, hedgehog } from './sprites'

const TIPS = [
    'PRESS F FOR FULLSCREEN',
    'KEYS 1 TO 9 JUMP AROUND THE VIDEO',
    'AGENTS DO NOT CLICK. THEY CALL TOOLS.',
    'EVERY TOOL CALL TELLS A STORY',
    'PRESS M TO MUTE',
]

// What the loading screen says as the bar fills, in the order the sound arrives.
const STATUS = [
    [0.25, 'TUNING THE CHIPTUNES'],
    [0.5, 'WAKING THE ROBOTS'],
    [0.75, 'FEEDING THE HEDGEHOG'],
    [1, 'PLUGGING IN THE MCP'],
] as const

const BAR = { x: 60, y: 104, segments: 20, segmentWidth: 9, height: 14 }
const TICK_MS = 120

// drawText has a shadow option, but its inferred type leaves it out, so the shadow is a second pass one pixel lower.
function titleText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
    drawText(ctx, text, x, y + 3, { color: 'O', scale: 3 })
    drawText(ctx, text, x, y, { color: 'o', scale: 3 })
}

const centered = (text: string, scale = 1): number => Math.round((W - measure(text) * scale) / 2)

function paint(ctx: CanvasRenderingContext2D, progress: number, tick: number): void {
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(21, 21, 21, 0.95)'
    ctx.fillRect(0, 0, W, H)

    const dots = '.'.repeat(Math.floor(tick / 3) % 4)
    titleText(ctx, 'LOADING', centered('LOADING', 3) - 6, 38)
    titleText(ctx, dots, centered('LOADING', 3) - 6 + measure('LOADING') * 3 + 3, 38)

    // The track and its segments, filled left to right, with the next one flickering to show it is working.
    const width = BAR.segments * (BAR.segmentWidth + 1) - 1
    rect(ctx, 'k', BAR.x - 2, BAR.y - 2, width + 4, BAR.height + 4)
    rect(ctx, 'd', BAR.x, BAR.y, width, BAR.height)
    const filled = Math.floor(progress * BAR.segments)
    for (let i = 0; i < BAR.segments; i++) {
        const x = BAR.x + i * (BAR.segmentWidth + 1)
        if (i < filled) {
            rect(ctx, 'o', x, BAR.y, BAR.segmentWidth, BAR.height)
            rect(ctx, 'y', x, BAR.y, BAR.segmentWidth, 2)
            rect(ctx, 'O', x, BAR.y + BAR.height - 2, BAR.segmentWidth, 2)
        } else if (i === filled && progress < 1 && tick % 4 < 2) {
            rect(ctx, 'g', x, BAR.y, BAR.segmentWidth, BAR.height)
        }
    }

    // The hedgehog rides the front of the bar, hopping and waving.
    const hog = hedgehog(tick % 4 < 2 ? 'waveA' : 'waveB', tick % 17 === 0)
    const hop = Math.round(Math.abs(Math.sin(tick / 1.6)) * 3)
    draw(ctx, hog, BAR.x - 2 + progress * (width - hog.w + 4), BAR.y - 3 - hog.h - hop)

    const status = progress >= 1 ? 'PRESS START' : (STATUS.find(([limit]) => progress < limit)?.[1] ?? 'PRESS START')
    drawText(ctx, status, centered(status), 126, { color: progress >= 1 && tick % 4 < 2 ? 'y' : 'S' })
    const percent = `${Math.round(progress * 100)}%`
    drawText(ctx, percent, centered(percent), 138, { color: 'w' })

    const tip = `TIP: ${TIPS[Math.floor(tick / 20) % TIPS.length]}`
    drawText(ctx, tip, centered(tip), 152, { color: 's' })
    ctx.fillStyle = PALETTE.k
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
            className="absolute inset-0"
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
