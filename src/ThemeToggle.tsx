import React, { useState } from 'react'
import { IconMoon, IconSun } from './icons'
import { currentTheme, setTheme } from './theme'

export default function ThemeToggle(): JSX.Element {
    const [theme, setCurrent] = useState(currentTheme)
    const next = theme === 'dark' ? 'light' : 'dark'

    return (
        <button
            type="button"
            aria-label={`Switch to the ${next} theme`}
            title={`Switch to the ${next} theme`}
            onClick={() => {
                setTheme(next)
                setCurrent(next)
            }}
            className="flex size-9 items-center justify-center rounded-lg border border-line hover:border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
            {theme === 'dark' ? <IconSun className="size-5" /> : <IconMoon className="size-5" />}
        </button>
    )
}
