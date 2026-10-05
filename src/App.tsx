import React, { useEffect, useState } from 'react'
import { CHAPTERS } from './player'
import { FPS, FRAMES } from './timeline'
import Video from './Video'

const POSTHOG_URL = 'https://posthog.com/mcp-analytics'
const params = new URLSearchParams(window.location.search)
const embed = params.get('embed') === '1'

const theme = params.get('theme') ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light'

// ?chapter=3 starts at that chapter, ?t=90 starts at 90 seconds. Neither autoplays, because browsers block sound until a click.
function initialFrame(): number {
    const chapter = Number(params.get('chapter'))
    if (params.has('chapter') && CHAPTERS[chapter]) return CHAPTERS[chapter].start
    const seconds = Number(params.get('t'))
    return params.has('t') && seconds > 0 ? Math.min(FRAMES - 1, Math.round(seconds * FPS)) : 0
}

const embedSnippet = (): string => {
    const src = `${location.origin}${location.pathname}?embed=1`
    return `<iframe src="${src}" title="MCP analytics: an 8-bit tale" width="960" height="540" style="border:0;width:100%;aspect-ratio:16/9" allow="fullscreen" allowfullscreen loading="lazy"></iframe>`
}

function EmbedButton(): JSX.Element {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!copied) return
        const timer = setTimeout(() => setCopied(false), 2000)
        return () => clearTimeout(timer)
    }, [copied])

    return (
        <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(embedSnippet()).then(() => setCopied(true))}
            className="rounded border border-line px-3 py-1.5 text-sm font-semibold hover:border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
            {copied ? 'Copied the iframe code' : 'Copy embed code'}
        </button>
    )
}

export default function App(): JSX.Element {
    if (embed) {
        return (
            <div className="h-full">
                <Video fill initialFrame={initialFrame()} />
            </div>
        )
    }

    return (
        <main className="mx-auto flex min-h-full max-w-5xl flex-col gap-4 px-4 py-6">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold leading-tight">MCP analytics: an 8-bit tale</h1>
                    <p className="text-muted-fg">
                        A four-minute pixel-art story about product analytics for AI agents.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <EmbedButton />
                    <a
                        href={POSTHOG_URL}
                        className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                    >
                        PostHog MCP analytics
                    </a>
                </div>
            </header>
            <Video initialFrame={initialFrame()} />
            <footer className="text-sm text-muted-fg">
                <p>
                    Every frame is drawn live in your browser from code, so there is no video file. Press Space to play,
                    F for fullscreen, and the arrow keys to skip.
                </p>
                <p>
                    Music from Epidemic Sound. Sound effects from an 8-bit SFX library. Learn more about{' '}
                    <a href={POSTHOG_URL} className="underline hover:text-fg">
                        PostHog MCP analytics
                    </a>
                    .
                </p>
            </footer>
        </main>
    )
}
