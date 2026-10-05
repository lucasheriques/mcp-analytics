const ENDPOINT = 'https://mcp-analytics-views.lucasheriques.workers.dev/view'
const COUNTED_KEY = 'mcp-analytics-view-counted'

const hostnameOf = (url: string): string => {
    try {
        return new URL(url).hostname
    } catch {
        return ''
    }
}

// Sends one anonymous count per browser tab session: only whether this was the page or an embed, and for an embed the hostname
// of the page that holds it. Nothing is sent from localhost or when the browser asks not to be tracked.
export function recordView(): void {
    const { hostname, search } = window.location
    const optedOut =
        navigator.doNotTrack === '1' || (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl
    if (optedOut || hostname === 'localhost' || hostname === '127.0.0.1') return

    try {
        if (sessionStorage.getItem(COUNTED_KEY)) return
        sessionStorage.setItem(COUNTED_KEY, '1')
    } catch {
        // storage is blocked, so this load counts without a once-per-session guard
    }

    const embed = new URLSearchParams(search).get('embed') === '1'
    // A text body keeps this a simple cross-origin request, so the browser sends no preflight.
    void fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,
        body: JSON.stringify({ kind: embed ? 'embed' : 'page', host: embed ? hostnameOf(document.referrer) : '' }),
    }).catch(() => undefined)
}
