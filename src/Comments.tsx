import React, { useEffect, useRef } from 'react'
import { currentTheme } from './theme'

const GISCUS = {
    'data-repo': 'lucasheriques/mcp-analytics',
    'data-repo-id': 'R_kgDOU8_tXg',
    'data-category': 'Announcements',
    'data-category-id': 'DIC_kwDOU8_tXs4DHG4R',
    'data-mapping': 'specific',
    'data-term': 'MCP analytics: an 8-bit tale',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-lang': 'en',
    'data-loading': 'lazy',
}

// giscus loads a theme from an absolute https URL, so this always points at the deployed CSS in public/.
const THEME_BASE = 'https://lucasheriques.github.io/mcp-analytics/'

const themeUrl = (): string => `${THEME_BASE}giscus-${currentTheme()}.css`

// Comments live in this repo's GitHub Discussions through giscus. Readers sign in with GitHub to comment.
export default function Comments(): JSX.Element {
    const container = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://giscus.app/client.js'
        script.async = true
        script.crossOrigin = 'anonymous'
        for (const [name, value] of Object.entries(GISCUS)) script.setAttribute(name, value)
        script.setAttribute('data-theme', themeUrl())
        container.current?.append(script)

        // giscus reads its theme once, so after a switch the new one is sent to its iframe.
        const observer = new MutationObserver(() => {
            const frame = container.current?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
            if (!frame) return
            const send = (): void =>
                frame.contentWindow?.postMessage({ giscus: { setConfig: { theme: themeUrl() } } }, 'https://giscus.app')
            send()
            // A switch that lands before the iframe has loaded is lost, so send it again once it has.
            frame.addEventListener('load', send, { once: true })
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
        return () => {
            observer.disconnect()
            container.current?.querySelectorAll('script, .giscus, iframe').forEach((node) => node.remove())
        }
    }, [])

    return (
        <section aria-labelledby="comments-heading" className="flex flex-col gap-2">
            <h2 id="comments-heading" className="text-lg font-bold">
                Comments
            </h2>
            {/* The empty widget is 372px tall. Reserving that height means it fills a space that already exists instead of pushing
                the sections below it down when it loads. */}
            <div ref={container} className="relative min-h-[372px] [&_.giscus]:relative">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center rounded-lg border border-line bg-subtle text-sm text-muted-fg"
                >
                    Loading comments…
                </div>
            </div>
        </section>
    )
}
