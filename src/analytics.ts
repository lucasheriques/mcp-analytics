const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com'
const embeddedIn = window.self === window.top ? null : document.referrer

// posthog-js loads only when a project key is configured at build time, so a build without one sends nothing.
const posthog = key
    ? import('posthog-js').then(({ default: ph }) => {
          ph.init(key, { api_host: host, person_profiles: 'identified_only' })
          return ph
      })
    : null

export function capture(event: string, properties: Record<string, unknown>): void {
    void posthog?.then((ph) => ph.capture(event, { ...properties, embedded: embeddedIn !== null, embed_referrer: embeddedIn }))
}
