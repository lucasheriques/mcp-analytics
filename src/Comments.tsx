import React, { useEffect, useRef } from 'react'

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

// Comments live in this repo's GitHub Discussions through giscus. Readers sign in with GitHub to comment.
export default function Comments(): JSX.Element {
    const container = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://giscus.app/client.js'
        script.async = true
        script.crossOrigin = 'anonymous'
        for (const [name, value] of Object.entries(GISCUS)) script.setAttribute(name, value)
        script.setAttribute('data-theme', document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
        container.current?.append(script)
        return () => {
            container.current?.replaceChildren()
        }
    }, [])

    return (
        <section aria-labelledby="comments-heading" className="flex flex-col gap-2">
            <h2 id="comments-heading" className="text-lg font-bold">
                Comments
            </h2>
            <div ref={container} />
        </section>
    )
}
