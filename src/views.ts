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
// needs no IP address or ID to tell repeat visitors apart. Clearing storage resets it, which is fine for a rough count.
const countedThisSession = new Set<Kind>()
function dueForCount(kind: Kind): boolean {
    if (countedThisSession.has(kind)) return false
    countedThisSession.add(kind)
    try {
        const key = `mcp-analytics-counted-${kind}`
        const last = Number(localStorage.getItem(key))
        if (last && Date.now() - last < COUNT_AGAIN_AFTER_MS) return false
        localStorage.setItem(key, String(Date.now()))
    } catch {
        // storage is blocked, so this page load counts once and nothing remembers it
    }
    return true
}

function send(kind: Kind): void {
    if (!mayCount() || !dueForCount(kind)) return
    const host = embedded() ? hostnameOf(document.referrer) : ''
    // A text body keeps this a simple cross-origin request, so the browser sends no preflight.
    void fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,
        body: JSON.stringify({ kind, host }),
    }).catch(() => undefined)
}

// One count when the page or embed loads.
export const recordView = (): void => send(embedded() ? 'embed' : 'page')

// One count after ten seconds of actual playback.
export const recordWatched = (): void => send('watched')

// The total views across pages and embeds, or null when the Worker cannot be reached (for example from localhost).
export async function fetchViewCount(): Promise<number | null> {
    try {
        const response = await fetch(`${WORKER}/count`)
        if (!response.ok) return null
        const { views } = (await response.json()) as { views?: unknown }
        return typeof views === 'number' ? views : null
    } catch {
        return null
    }
}
