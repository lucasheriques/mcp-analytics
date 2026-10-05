interface Env {
    DB: D1Database
    VIEW_LIMITER: RateLimit
}

const SITE_ORIGIN = 'https://lucasheriques.github.io'
const HOSTNAME = /^[a-z0-9.-]{1,100}$/
const COUNT_CACHE_SECONDS = 60
// Raise this after clearing the table so no data center keeps serving the old total.
const CACHE_VERSION = 4
// A hard ceiling on counted views per day. It bounds how far anyone can inflate the numbers or spend the free database quota.
const DAILY_CAP = 5000

// The Workers runtime adds `default`, the cache shared by every request in this data center, to the standard CacheStorage.
const edgeCache = (): Cache => (caches as CacheStorage & { default: Cache }).default

// Counts per day, per kind ("page" or "embed" for a load, "watched" for ten seconds of playback), and per embedding hostname. It stores no IP address, user agent, or cookie.
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url)
        if (request.method === 'POST' && url.pathname === '/view') return recordView(request, env)
        if (request.method === 'GET' && url.pathname === '/count') return totalViews(request, env, ctx)
        return new Response('Not found', { status: 404 })
    },
}

async function recordView(request: Request, env: Env): Promise<Response> {
    if (request.headers.get('origin') !== SITE_ORIGIN) return new Response(null, { status: 403 })

    // The IP is only the rate-limit key. Cloudflare counts it for a minute and the Worker never stores it.
    const { success } = await env.VIEW_LIMITER.limit({ key: request.headers.get('cf-connecting-ip') ?? 'unknown' })
    if (!success) return new Response(null, { status: 429 })

    let body: { kind?: unknown; host?: unknown } | null
    try {
        body = JSON.parse(await request.text())
    } catch {
        return new Response(null, { status: 400 })
    }
    if (typeof body !== 'object' || body === null) return new Response(null, { status: 400 })
    const { kind, host } = body
    if (kind !== 'page' && kind !== 'embed' && kind !== 'watched') return new Response(null, { status: 400 })
    const embeddedIn = kind !== 'page' && typeof host === 'string' && HOSTNAME.test(host) ? host : ''

    const day = new Date().toISOString().slice(0, 10)
    const today = await env.DB.prepare('SELECT COALESCE(SUM(count), 0) AS views FROM views WHERE day = ?1')
        .bind(day)
        .first<{ views: number }>()
    if ((today?.views ?? 0) >= DAILY_CAP) return new Response(null, { status: 429 })

    await env.DB.prepare(
        `INSERT INTO views (day, kind, host, count) VALUES (?1, ?2, ?3, 1)
         ON CONFLICT (day, kind, host) DO UPDATE SET count = count + 1`
    )
        .bind(day, kind, embeddedIn)
        .run()
    return new Response(null, { status: 204 })
}

// The total is cached, so repeated reads cost the database one query every few minutes.
async function totalViews(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const cacheKey = new Request(new URL(`/count?v=${CACHE_VERSION}`, request.url).toString())
    const cached = await edgeCache().match(cacheKey)
    if (cached) return cached

    const row = await env.DB.prepare(
        `SELECT COALESCE(SUM(CASE WHEN kind != 'watched' THEN count END), 0) AS views,
                COALESCE(SUM(CASE WHEN kind = 'watched' THEN count END), 0) AS watched
         FROM views`
    ).first<{ views: number; watched: number }>()
    const response = Response.json(
        { views: row?.views ?? 0, watched: row?.watched ?? 0 },
        {
            headers: {
                'access-control-allow-origin': SITE_ORIGIN,
                'cache-control': `public, max-age=${COUNT_CACHE_SECONDS}`,
                vary: 'Origin',
            },
        }
    )
    ctx.waitUntil(edgeCache().put(cacheKey, response.clone()))
    return response
}
