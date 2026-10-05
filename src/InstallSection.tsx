import React from 'react'
import CopyButton from './CopyButton'
import { SETUP_COMMAND } from './links'

export default function InstallSection(): JSX.Element {
    return (
        <section aria-labelledby="install-heading" className="flex flex-col gap-2">
            <h2 id="install-heading" className="text-lg font-bold">
                Add it to your MCP server
            </h2>
            <p className="text-muted-fg">Run this in your MCP server's project to add PostHog MCP analytics.</p>
            <div className="flex flex-wrap items-center gap-2">
                <pre className="min-w-0 flex-1 overflow-x-auto rounded border border-line bg-surface p-3 text-sm">
                    <code>{SETUP_COMMAND}</code>
                </pre>
                <CopyButton
                    text={SETUP_COMMAND}
                    label="Copy command"
                    className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-on-brand hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                />
            </div>
        </section>
    )
}
