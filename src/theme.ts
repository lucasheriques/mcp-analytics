export type Theme = 'light' | 'dark'

const KEY = 'mcp-analytics-theme'

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark'

function saved(): Theme | null {
    try {
        const value = localStorage.getItem(KEY)
        return isTheme(value) ? value : null
    } catch {
        return null
    }
}

export const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

// ?theme= wins so an embed can force one, then a saved choice, then the system setting.
export function initTheme(): void {
    const fromUrl = new URLSearchParams(window.location.search).get('theme')
    const theme = isTheme(fromUrl)
        ? fromUrl
        : (saved() ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
    document.documentElement.dataset.theme = theme
}

export function setTheme(theme: Theme): void {
    document.documentElement.dataset.theme = theme
    try {
        localStorage.setItem(KEY, theme)
    } catch {
        // storage is blocked; the choice lasts until the page reloads
    }
}
