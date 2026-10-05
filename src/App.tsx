import React from 'react'
import { Logo } from '@posthog/brand/logo'
import Comments from './Comments'
import EmbedSection from './EmbedSection'
import InstallSection from './InstallSection'
import { IconGitHub } from './icons'
import { AUTHOR_URL, ExternalLink, POSTHOG_HOME, POSTHOG_MCP_ANALYTICS, REPO_URL } from './links'
import { CHAPTERS } from './player'
import { initTheme } from './theme'
import ThemeToggle from './ThemeToggle'
import { FPS, FRAMES } from './timeline'
import Video from './Video'
import ViewCount from './ViewCount'

const params = new URLSearchParams(window.location.search)
const embed = params.get('embed') === '1'

initTheme()

// ?chapter=3 starts at that chapter, ?t=90 starts at 90 seconds. Neither autoplays, because browsers block sound until a click.
function initialFrame(): number {
    const chapter = Number(params.get('chapter'))
    if (params.has('chapter') && CHAPTERS[chapter]) return CHAPTERS[chapter].start
    const seconds = Number(params.get('t'))
    return params.has('t') && seconds > 0 ? Math.min(FRAMES - 1, Math.round(seconds * FPS)) : 0
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
                    <ExternalLink href={POSTHOG_HOME} aria-label="PostHog" className="mb-2 inline-block text-fg">
                        <Logo variant="gradient" size={112} className="dark:hidden" />
                        <Logo variant="mono" size={112} className="hidden dark:block" />
                    </ExternalLink>
                    <h1 className="text-2xl font-bold leading-tight">MCP analytics: an 8-bit tale</h1>
                    <p className="text-muted-fg">
                        A four-minute pixel-art story about product analytics for AI agents.
                    </p>
                    <p className="text-sm text-muted-fg">
                        Made by{' '}
                        <ExternalLink href={AUTHOR_URL} className="underline hover:text-fg">
                            Lucas Faria
                        </ExternalLink>
                        , who works on MCP analytics at PostHog.
                        <ViewCount />
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ExternalLink
                        href={REPO_URL}
                        className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                    >
                        <IconGitHub className="size-4" />
                        GitHub
                    </ExternalLink>
                    <ThemeToggle />
                    <ExternalLink
                        href={POSTHOG_MCP_ANALYTICS}
                        className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-on-brand hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                    >
                        PostHog MCP analytics
                    </ExternalLink>
                </div>
            </header>
            <Video initialFrame={initialFrame()} />
            <InstallSection />
            <Comments />
            <EmbedSection />
            <footer className="flex flex-col gap-1 border-t border-line pt-4 text-sm text-muted-fg">
                <p>
                    Curious about the product? Read about{' '}
                    <ExternalLink href={POSTHOG_MCP_ANALYTICS} className="underline hover:text-fg">
                        PostHog MCP analytics
                    </ExternalLink>
                    . The{' '}
                    <ExternalLink href={REPO_URL} className="underline hover:text-fg">
                        code behind this video
                    </ExternalLink>{' '}
                    is on GitHub.
                </p>
            </footer>
        </main>
    )
}
