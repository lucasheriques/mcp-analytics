import React from 'react'
import Home from './Home'
import Tale, { TaleEmbed } from './Tale'
import { initTheme } from './theme'

const params = new URLSearchParams(window.location.search)

initTheme()

// The tale used to be the home page, so its old links still open it: embeds, and links to a chapter or a time.
export const showsTale =
    document.documentElement.dataset.page === 'tale' || ['embed', 'chapter', 't'].some((name) => params.has(name))

export default function App(): JSX.Element {
    if (params.get('embed') === '1') return <TaleEmbed />
    return showsTale ? <Tale /> : <Home />
}
