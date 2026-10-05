import { useEffect, useRef, useState } from 'react'

// A loading indicator that appears only if loading outlasts `delayMs`, and then stays for at least `minVisibleMs`. A load that
// finishes quickly shows nothing, and one that does show never blinks on and off.
export function useDelayedFlag(active: boolean, delayMs: number, minVisibleMs: number): boolean {
    const [visible, setVisible] = useState(false)
    const shownAt = useRef(0)

    useEffect(() => {
        if (active) {
            const timer = setTimeout(() => {
                shownAt.current = Date.now()
                setVisible(true)
            }, delayMs)
            return () => clearTimeout(timer)
        }
        const remaining = Math.max(0, minVisibleMs - (Date.now() - shownAt.current))
        const timer = setTimeout(() => setVisible(false), remaining)
        return () => clearTimeout(timer)
    }, [active, delayMs, minVisibleMs])

    return visible
}
