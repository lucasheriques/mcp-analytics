import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { prewarmAudio } from './audioAssets'
import { injectBrand } from './brand'
import { recordView } from './views'

injectBrand()
recordView()
// Embeds skip this so a page that holds one does not download audio nobody plays.
if (new URLSearchParams(window.location.search).get('embed') !== '1') prewarmAudio()

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
