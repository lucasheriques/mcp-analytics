import React from 'react'

export const POSTHOG_HOME = 'https://posthog.com'
export const POSTHOG_MCP_ANALYTICS = 'https://posthog.com/mcp-analytics'
export const POSTHOG_MCP_ANALYTICS_DOCS = 'https://posthog.com/docs/mcp-analytics'
export const AUTHOR_URL = 'https://github.com/lucasheriques'
export const REPO_URL = 'https://github.com/lucasheriques/mcp-analytics'
// A release asset keeps the 36 MB file out of the repo. To replace it, publish a new release with a file of the same name.
export const VIDEO_DOWNLOAD_URL = `${REPO_URL}/releases/latest/download/mcp-analytics-an-8-bit-tale.mp4`
export const SETUP_COMMAND = 'npx -y @posthog/wizard@latest mcp-analytics'

// Opens in a new tab so it also works from inside an iframe.
export function ExternalLink(
    props: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'>
): JSX.Element {
    return <a {...props} target="_blank" rel="noopener" />
}
