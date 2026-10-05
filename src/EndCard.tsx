import React from 'react'
import CopyButton from './CopyButton'
import { POSTHOG_MCP_ANALYTICS, POSTHOG_MCP_ANALYTICS_DOCS, ExternalLink, SETUP_COMMAND } from './links'

export default function EndCard({ onReplay }: { onReplay: () => void }): JSX.Element {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 p-4 text-center text-white @md:gap-5">
            <p className="text-lg font-bold @md:text-3xl">Stop building blind.</p>
            <p className="max-w-md text-sm text-white/80 @md:text-base">
                See which tools agents call, what breaks, and what they were trying to do on your MCP server.
            </p>
            <div className="flex max-w-full flex-wrap items-center justify-center gap-2">
                <code className="select-all overflow-x-auto rounded bg-white/10 px-3 py-1.5 text-xs @md:text-sm">
                    {SETUP_COMMAND}
                </code>
                <CopyButton
                    text={SETUP_COMMAND}
                    label="Copy"
                    className="rounded border border-white/40 px-3 py-1.5 text-xs font-semibold hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white @md:text-sm"
                />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
                <ExternalLink
                    href={POSTHOG_MCP_ANALYTICS}
                    className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-on-brand hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    Try PostHog MCP analytics
                </ExternalLink>
                <ExternalLink
                    href={POSTHOG_MCP_ANALYTICS_DOCS}
                    className="rounded border border-white/40 px-3 py-1.5 text-sm font-semibold hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    Read the docs
                </ExternalLink>
                <button
                    type="button"
                    onClick={onReplay}
                    className="rounded border border-white/40 px-3 py-1.5 text-sm font-semibold hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    Watch again
                </button>
            </div>
        </div>
    )
}
