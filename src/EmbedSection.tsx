import megaphoneHog from '@posthog/brand/hoggies/png/megaphone'
import React from 'react'
import CopyButton from './CopyButton'
import { VIDEO_DOWNLOAD_URL } from './links'

const snippet = (): string => {
    const src = `${location.origin}${location.pathname}?embed=1`
    return `<iframe src="${src}" title="MCP analytics: an 8-bit tale" width="960" height="540" style="border:0;width:100%;aspect-ratio:16/9" allow="fullscreen" allowfullscreen loading="lazy"></iframe>`
}

export default function EmbedSection(): JSX.Element {
    const code = snippet()

    return (
        <section id="embed" aria-labelledby="embed-heading" className="flex items-center gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h2 id="embed-heading" className="text-lg font-bold">
                    Embed it or download it
                </h2>
                <p className="text-muted-fg">
                    Paste this into any page. Keep <code>allow="fullscreen"</code>, or fullscreen will not work inside
                    the iframe. Add <code>&amp;chapter=3</code> to start at a level, or <code>&amp;theme=dark</code> to
                    force a theme. Or download the MP4 (1080p, 36 MB) to share it anywhere else.
                </p>
                <pre className="overflow-x-auto rounded-lg border border-line bg-subtle p-3 text-xs">
                    <code>{code}</code>
                </pre>
                <div className="flex flex-wrap items-center gap-2">
                    <CopyButton
                        text={code}
                        label="Copy embed code"
                        className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-on-brand hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                    />
                    <a
                        href={`${import.meta.env.BASE_URL}embed-example.html`}
                        target="_blank"
                        rel="noopener"
                        className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                    >
                        See an example page
                    </a>
                    <a
                        href={VIDEO_DOWNLOAD_URL}
                        download
                        className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                    >
                        Download MP4
                    </a>
                </div>
            </div>
            <img
                src={megaphoneHog}
                alt=""
                width={112}
                height={112}
                loading="lazy"
                className="hidden size-28 shrink-0 sm:block"
            />
        </section>
    )
}
