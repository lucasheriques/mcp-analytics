import React, { useEffect, useState } from 'react'

const snippet = (): string => {
    const src = `${location.origin}${location.pathname}?embed=1`
    return `<iframe src="${src}" title="MCP analytics: an 8-bit tale" width="960" height="540" style="border:0;width:100%;aspect-ratio:16/9" allow="fullscreen" allowfullscreen loading="lazy"></iframe>`
}

// The clipboard API needs a secure page, focus, and permission, and some browsers and iframes refuse it, so fall back to the
// older copy command through a hidden textarea.
async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        const field = Object.assign(document.createElement('textarea'), { value: text })
        field.style.position = 'fixed'
        field.style.opacity = '0'
        document.body.append(field)
        field.select()
        const copied = document.execCommand('copy')
        field.remove()
        return copied
    }
}

export default function EmbedSection(): JSX.Element {
    const [copied, setCopied] = useState<boolean | null>(null)
    const code = snippet()

    useEffect(() => {
        if (copied === null) return
        const timer = setTimeout(() => setCopied(null), 2000)
        return () => clearTimeout(timer)
    }, [copied])

    return (
        <section id="embed" aria-labelledby="embed-heading" className="flex flex-col gap-2">
            <h2 id="embed-heading" className="text-lg font-bold">
                Embed it on your site
            </h2>
            <p className="text-muted-fg">
                Paste this into any page. Keep <code>allow="fullscreen"</code>, or fullscreen will not work inside the
                iframe. Add <code>&amp;chapter=3</code> to start at a level, or <code>&amp;theme=dark</code> to force a
                theme.
            </p>
            <pre className="overflow-x-auto rounded border border-line bg-surface p-3 text-xs">
                <code>{code}</code>
            </pre>
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => void copyText(code).then(setCopied)}
                    className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-on-brand hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                >
                    {copied === null ? 'Copy embed code' : copied ? 'Copied' : 'Press Ctrl+C to copy'}
                </button>
                <a
                    href={`${import.meta.env.BASE_URL}embed-example.html`}
                    target="_blank"
                    rel="noopener"
                    className="rounded border border-line px-3 py-1.5 text-sm font-semibold hover:border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                >
                    See an example page
                </a>
            </div>
        </section>
    )
}
