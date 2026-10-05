const WORKER = 'https://mcp-analytics-views.lucasheriques.workers.dev'
const ENDPOINT = `${WORKER}/view`
const COUNT_AGAIN_AFTER_MS = 24 * 60 * 60 * 1000

type Kind = 'page' | 'embed' | 'watched'

const embedded = (): boolean => new URLSearchParams(window.location.search).get('embed') === '1'

const hostnameOf = (url: string): string => {
    try {
        return new URL(url).hostname
    } catch {
        return ''
    }
}

// Nothing is sent from localhost or when the browser asks not to be tracked.
function mayCount(): boolean {
    const { hostname } = window.location
    const optedOut =
        navigator.doNotTrack === '1' || (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl
    return !optedOut && hostname !== 'localhost' && hostname !== '127.0.0.1'
}

// A browser counts once per kind every 24 hours. The time of the last count stays in this browser's localStorage, so the Worker
// needs no IP address or ID to tell repeat visitors apart. It is written only after the Worker confirms the count, so a request
// that was blocked or refused is tried again on the next visit. Clearing storage resets it, which is fine for a rough count.
const attemptedThisSession = new Set<Kind>()
const storageKey = (kind: Kind): string => `mcp-analytics-counted-${kind}`

function countedRecently(kind: Kind): boolean {
    try {
        const last = Number(localStorage.getItem(storageKey(kind)))
        return last > 0 && Date.now() - last < COUNT_AGAIN_AFTER_MS
    } catch {
        return false
    }
}

function remember(kind: Kind): void {
    try {
        localStorage.setItem(storageKey(kind), String(Date.now()))
    } catch {
        // storage is blocked; the count stands, and nothing remembers it
    }
}

async function send(kind: Kind): Promise<void> {
    if (!mayCount() || attemptedThisSession.has(kind) || countedRecently(kind)) return
    attemptedThisSession.add(kind)
    const host = embedded() ? hostnameOf(document.referrer) : ''
    try {
        // A text body keeps this a simple cross-origin request, so the browser sends no preflight.
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            keepalive: true,
            body: JSON.stringify({ kind, host }),
        })
        if (response.ok) remember(kind)
    } catch {
        // blocked or offline; the next visit tries again
    }
}

// One count when the page or embed loads.
export const recordView = (): void => void send(embedded() ? 'embed' : 'page')

// One count after ten seconds of actual playback.
export const recordWatched = (): void => void send('watched')

// How many people have watched (ten seconds of playback), or null when the Worker cannot be reached (for example from localhost).
export async function fetchViewCount(): Promise<number | null> {
    try {
        const response = await fetch(`${WORKER}/count`)
        if (!response.ok) return null
        const { watched } = (await response.json()) as { watched?: unknown }
        return typeof watched === 'number' ? watched : null
    } catch {
        return null
    }
}
