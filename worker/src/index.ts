interface Env {
    DB: D1Database
}

const ALLOWED_ORIGINS = new Set(['https://lucasheriques.github.io'])
const HOSTNAME = /^[a-z0-9.-]{1,100}$/

// Counts one view per day, per kind ("page" or "embed"), and per embedding hostname. It stores no IP address, user agent, or cookie.
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url)
        if (request.method !== 'POST' || url.pathname !== '/view') return new Response('Not found', { status: 404 })
        if (!ALLOWED_ORIGINS.has(request.headers.get('origin') ?? '')) return new Response(null, { status: 403 })

        let body: { kind?: unknown; host?: unknown } | null
        try {
            body = JSON.parse(await request.text())
        } catch {
            return new Response(null, { status: 400 })
        }
        if (typeof body !== 'object' || body === null) return new Response(null, { status: 400 })
        const { kind, host } = body
        if (kind !== 'page' && kind !== 'embed') return new Response(null, { status: 400 })
        const embeddedIn = kind === 'embed' && typeof host === 'string' && HOSTNAME.test(host) ? host : ''

        await env.DB.prepare(
            `INSERT INTO views (day, kind, host, count) VALUES (?1, ?2, ?3, 1)
             ON CONFLICT (day, kind, host) DO UPDATE SET count = count + 1`
        )
            .bind(new Date().toISOString().slice(0, 10), kind, embeddedIn)
            .run()
        return new Response(null, { status: 204 })
    },
}
