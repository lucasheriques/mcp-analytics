import React from 'react'

export const POSTHOG_MCP_ANALYTICS = 'https://posthog.com/mcp-analytics'
export const POSTHOG_MCP_ANALYTICS_DOCS = 'https://posthog.com/docs/mcp-analytics'
export const REPO_URL = 'https://github.com/lucasheriques/mcp-analytics'
export const SETUP_COMMAND = 'npx -y @posthog/wizard@latest mcp-analytics'

// Opens in a new tab so it also works from inside an iframe.
export function ExternalLink(
    props: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'>
): JSX.Element {
    return <a {...props} target="_blank" rel="noopener" />
}
