import { SPEEDS } from './player'
import type { Speed } from './player'
import { FPS, FRAMES } from './timeline'

const KEY = 'mcp-analytics-8-bit-tale'
const MIN_RESUME_SECONDS = 5
const MIN_REMAINING_SECONDS = 10

export interface Saved {
    frame: number
    volume: number
    muted: boolean
    speed: Speed
}

const number = (value: unknown): number | undefined =>
    typeof value === 'number' && isFinite(value) ? value : undefined

// localStorage can be missing or throw (private windows, blocked storage), so every read and write is guarded.
export function loadSaved(): Partial<Saved> {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, unknown>
        const volume = number(raw.volume)
        const speed = SPEEDS.find((s) => s === raw.speed)
        return {
            frame: number(raw.frame),
            volume: volume === undefined ? undefined : Math.max(0, Math.min(1, volume)),
            muted: typeof raw.muted === 'boolean' ? raw.muted : undefined,
            speed,
        }
    } catch {
        return {}
    }
}

export function save(saved: Saved): void {
    try {
        localStorage.setItem(KEY, JSON.stringify(saved))
    } catch {
        // storage is full or blocked; the player still works without it
    }
}

// A viewer who stopped in the first seconds or near the end starts over instead of resuming.
export const resumeFrame = (frame: number | undefined): number =>
    frame !== undefined && frame >= MIN_RESUME_SECONDS * FPS && frame <= FRAMES - 1 - MIN_REMAINING_SECONDS * FPS
        ? Math.round(frame)
        : 0
