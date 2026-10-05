import { MUSIC_CHOICE, SFX } from './timeline'

const ASSETS = import.meta.env.BASE_URL.replace(/\/$/, '')

interface Cue {
    file: string
    until?: number
}

const looped = new Set((SFX as Cue[]).filter((c) => c.until).map((c) => c.file))

export const sfxFiles = (): string[] => [...new Set((SFX as Cue[]).map((c) => c.file))]

// Looping beds stay WAV: AAC adds silent padding that would show up as a gap on every repeat.
export const sfxUrl = (file: string): string =>
    `${ASSETS}/sfx/${looped.has(file) ? file : file.replace(/\.wav$/, '.m4a')}`

export const musicUrl = (mood: keyof typeof MUSIC_CHOICE): string => `${ASSETS}/music/${MUSIC_CHOICE[mood]}`

// The order the moods first play in, so the next track can be fetched before it is needed.
export const MOODS_IN_ORDER = ['nostalgic', 'curious', 'tense', 'triumphant'] as const

const bytes = new Map<string, Promise<ArrayBuffer>>()

// Fetches a file once and keeps the bytes, so an early prefetch and the player share one download. A failed fetch is forgotten, so
// the player can try again. Decoding hands the buffer over, so callers decode a copy.
export function fetchBytes(url: string): Promise<ArrayBuffer> {
    let pending = bytes.get(url)
    if (!pending) {
        pending = fetch(url).then((response) => {
            if (!response.ok) throw new Error(`${response.status} for ${url}`)
            return response.arrayBuffer()
        })
        pending.catch(() => bytes.delete(url))
        bytes.set(url, pending)
    }
    return pending
}

// Starts the downloads while the viewer is still reading the page, so Play does not wait on a cold CDN. It skips viewers who ask
// to save data or are on a very slow connection.
export function prewarmAudio(): void {
    const connection = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) return
    const run = (): void => {
        for (const file of sfxFiles()) void fetchBytes(sfxUrl(file)).catch(() => undefined)
        void fetchBytes(musicUrl(MOODS_IN_ORDER[0])).catch(() => undefined)
    }
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 3000 })
    else setTimeout(run, 1500)
}

// Fetches the rest of the tracks one at a time, in the order they play.
export async function prefetchMusic(): Promise<void> {
    for (const mood of MOODS_IN_ORDER) await fetchBytes(musicUrl(mood)).catch(() => undefined)
}
