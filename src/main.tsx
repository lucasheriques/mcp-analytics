import React from 'react'
import { createRoot } from 'react-dom/client'
import App, { showsTale } from './App'
import './index.css'
import { prewarmAudio } from './audioAssets'
import { injectBrand } from './brand'
import { recordView } from './views'

injectBrand()
// The page count has always meant loads of the tale, so the home page stays out of it.
if (showsTale) recordView()
// Only the tale plays audio. Embeds skip this so a page that holds one does not download audio nobody plays.
if (showsTale && new URLSearchParams(window.location.search).get('embed') !== '1') prewarmAudio()

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
