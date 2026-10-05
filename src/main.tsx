import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { recordView } from './views'

recordView()

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
